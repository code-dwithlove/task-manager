package com.example.taskmanager.dto;

import com.example.taskmanager.model.Priority;
import com.example.taskmanager.model.TaskStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record TaskRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 150)
        String title,
        @Size(max = 1000) String description,
        TaskStatus status,
        Priority priority,
        @FutureOrPresent(message = "Due date cannot be in the past")
        LocalDate dueDate) {}
