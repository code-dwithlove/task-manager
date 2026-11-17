package com.example.taskmanager.service;

import com.example.taskmanager.dto.BreakdownRequest;
import com.example.taskmanager.dto.BreakdownResponse;
import com.example.taskmanager.dto.SuggestedTask;
import com.example.taskmanager.exception.AiException;
import com.example.taskmanager.exception.ResourceNotFoundException;
import com.example.taskmanager.model.User;
import com.example.taskmanager.repository.ProjectRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.net.http.HttpClient;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class AiBreakdownService {

    // shape of the part of Gemini's reply that we read
    record GeminiResponse(List<Candidate> candidates) {
        record Candidate(Content content) {}
        record Content(List<Part> parts) {}
        record Part(String text) {}
    }

    private final RestClient http;
    private final String apiKey;
    private final String model;
    private final ProjectRepository projectRepository;
    private final CurrentUserService currentUser;
    private final Map<Long, Deque<Instant>> calls = new ConcurrentHashMap<>();

    public AiBreakdownService(@Value("${app.ai.base-url}") String baseUrl,
                              @Value("${app.ai.api-key}") String apiKey,
                              @Value("${app.ai.model}") String model,
                              ProjectRepository projectRepository,
                              CurrentUserService currentUser) {
        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(client);
        factory.setReadTimeout(Duration.ofSeconds(60));
        this.http = RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
        this.apiKey = apiKey;
        this.model = model;
        this.projectRepository = projectRepository;
        this.currentUser = currentUser;
    }

    public BreakdownResponse breakdown(Long projectId, BreakdownRequest req) {
        User me = currentUser.get();
        projectRepository.findAccessible(projectId, me.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (apiKey == null || apiKey.isBlank()) {
            throw new AiException("AI is not configured on the server");
        }
        checkLimit(me.getId());

        List<SuggestedTask> tasks = parse(callModel(buildPrompt(req)));
        if (tasks.isEmpty()) {
            throw new AiException("The AI returned no tasks. Try rewording the goal.");
        }
        return new BreakdownResponse(tasks);
    }

    private String buildPrompt(BreakdownRequest req) {
        return """
            You are a project planning assistant. Break the goal into 3 to 8 concrete tasks,
            each small enough for one person to finish in a day or less.
            Reply with ONLY lines in exactly this format, one task per line,
            with no numbering, no markdown and no extra text:
            TITLE || PRIORITY || DESCRIPTION
            PRIORITY must be LOW, MEDIUM or HIGH. TITLE is under 80 characters.
            DESCRIPTION is one short sentence.

            Goal: %s
            Details: %s
            """.formatted(req.goal(), req.details() == null ? "none" : req.details());
    }

    private String callModel(String prompt) {
        Map<String, Object> body = Map.of("contents",
                List.of(Map.of("parts", List.of(Map.of("text", prompt)))));
        try {
            GeminiResponse res = http.post()
                    .uri("/models/{m}:generateContent", model)
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(GeminiResponse.class);
            if (res == null || res.candidates() == null || res.candidates().isEmpty()
                    || res.candidates().get(0).content() == null
                    || res.candidates().get(0).content().parts() == null
                    || res.candidates().get(0).content().parts().isEmpty()) {
                throw new AiException("The AI gave an empty answer. Try again.");
            }
            return res.candidates().get(0).content().parts().get(0).text();
        } catch (RestClientResponseException e) {
            log.warn("Gemini error {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 429) {
                throw new AiException("The free AI limit was reached. Try again in a minute.");
            }
            throw new AiException("The AI service returned an error (" + e.getStatusCode().value() + ").");
        } catch (RestClientException e) {
            log.warn("AI call failed", e);
            throw new AiException("Could not reach the AI service.");
        }
    }

    // turns the model's text into suggestions; tolerant of numbering, bullets and code fences
    static List<SuggestedTask> parse(String text) {
        List<SuggestedTask> out = new ArrayList<>();
        if (text == null) return out;
        for (String raw : text.split("\\R")) {
            String line = raw.replaceFirst("^\\s*(?:[-*]|\\d+[.)])\\s*", "").trim();
            if (line.isEmpty() || line.startsWith("```")) continue;
            String[] p = line.split("\\|\\|", 3);
            String title = clean(p[0], 120);
            if (title.isEmpty()) continue;
            String priority = p.length > 1 ? p[1].trim().toUpperCase() : "MEDIUM";
            if (!List.of("LOW", "MEDIUM", "HIGH").contains(priority)) priority = "MEDIUM";
            String description = p.length > 2 ? clean(p[2], 500) : "";
            out.add(new SuggestedTask(title, description, priority));
            if (out.size() == 8) break;
        }
        return out;
    }

    private static String clean(String s, int max) {
        String t = s.replaceAll("[*#`]", "").trim();
        return t.length() > max ? t.substring(0, max) : t;
    }

    // protects the free quota: 5 requests per user per minute
    private void checkLimit(Long userId) {
        Deque<Instant> q = calls.computeIfAbsent(userId, k -> new ArrayDeque<>());
        synchronized (q) {
            Instant cutoff = Instant.now().minusSeconds(60);
            while (!q.isEmpty() && q.peekFirst().isBefore(cutoff)) q.pollFirst();
            if (q.size() >= 5) throw new AiException("Too many AI requests. Wait a minute.");
            q.addLast(Instant.now());
        }
    }
}