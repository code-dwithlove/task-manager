package com.example.taskmanager.dto;

import com.example.taskmanager.model.ProjectRole;

public record MemberResponse(Long userId, String name, String email, ProjectRole role) {}
