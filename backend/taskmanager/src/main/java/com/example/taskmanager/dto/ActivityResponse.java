package com.example.taskmanager.dto;

import java.time.LocalDateTime;

public record ActivityResponse(Long id, String actorName, String message, LocalDateTime createdAt) {}
