package com.example.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BreakdownRequest (@NotBlank @Size(max = 500) String goal, @Size(max = 2000) String details) {}
