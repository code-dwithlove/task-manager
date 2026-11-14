
package com.example.taskmanager.controller;

import com.example.taskmanager.dto.TaskRequest;
import com.example.taskmanager.dto.TaskResponse;
import com.example.taskmanager.model.Priority;
import com.example.taskmanager.model.TaskStatus;
import com.example.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping("/projects/{projectId}/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse create(
            @PathVariable Long projectId,
            @Valid @RequestBody TaskRequest req) {

        return taskService.create(projectId, req);
    }

    @GetMapping("/projects/{projectId}/tasks")
    public List<TaskResponse> list(
            @PathVariable Long projectId,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) Priority priority) {

        return taskService.getByProject(projectId, status, priority);
    }

    @PatchMapping("/tasks/{id}/status")
    public TaskResponse updateStatus(
            @PathVariable Long id,
            @RequestParam TaskStatus status) {

        return taskService.updateStatus(id, status);
    }

    @DeleteMapping("/tasks/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        taskService.delete(id);
    }

    @PatchMapping("/tasks/{id}/assignee")
    public TaskResponse assign(@PathVariable Long id, @RequestParam(required = false) Long userId){
        return taskService.assign(id, userId);
    }
}
