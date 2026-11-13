package com.example.taskmanager.dto;

import java.time.LocalDateTime;

public record CommentResponse(Long id, String text, String authorName, String authorEmail, LocalDateTime createdAt) {}
