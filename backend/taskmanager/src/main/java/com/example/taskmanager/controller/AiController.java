package com.example.taskmanager.controller;

import com.example.taskmanager.dto.BreakdownRequest;
import com.example.taskmanager.dto.BreakdownResponse;
import com.example.taskmanager.service.AiBreakdownService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects/{projectId}/ai")
@RequiredArgsConstructor
public class AiController {
    private final AiBreakdownService service;

    @PostMapping("/breakdown")
    public BreakdownResponse breakdown(@PathVariable Long projectId, @Valid @RequestBody BreakdownRequest req){
        return service.breakdown(projectId, req);
    }
}
