package com.example.taskmanager.dto;

import com.example.taskmanager.model.Priority;
import com.example.taskmanager.model.TaskStatus;

import java.time.LocalDate;

public record TaskRequest(String title, String description, TaskStatus status, Priority priority, LocalDate dueDate) {
}
