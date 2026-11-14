package com.example.taskmanager.controller;

import com.example.taskmanager.dto.ActivityResponse;
import com.example.taskmanager.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ActivityController {
    private final ActivityService activityService;

    @GetMapping("/api/projects/{projectId}/activity")
    public List<ActivityResponse> feed(@PathVariable Long projectId){
        return activityService.getFeed(projectId);
    }
}
