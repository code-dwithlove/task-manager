package com.example.taskmanager.service;

import com.example.taskmanager.dto.SuggestedTask;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AiBreakdownParseTest {
    @Test
    void parsesLinesAndIgnoresNoise() {
        String text = "```\n1. Design form || HIGH || Sketch the fields\n"
                + "- Build API || medium || Add the endpoint\n"
                + "Test it\n```";

        List<SuggestedTask> result = AiBreakdownService.parse(text);

        assertEquals(3, result.size());
        assertEquals("Design form", result.get(0).title());
        assertEquals("HIGH", result.get(0).priority());
        assertEquals("MEDIUM", result.get(1).priority());
        assertEquals("MEDIUM", result.get(2).priority());   // no priority given: default
    }
}
