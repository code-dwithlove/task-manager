package com.example.taskmanager.dto;

import java.time.LocalDateTime;

public record NotificationResponse(Long id, String message, Long projectId,
                                   boolean seen, LocalDateTime createdAt) {}