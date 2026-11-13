package com.example.taskmanager.controller;

import com.example.taskmanager.dto.CommentRequest;
import com.example.taskmanager.dto.CommentResponse;
import com.example.taskmanager.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @GetMapping("/api/tasks/{taskId}/comments")
    public List<CommentResponse> list(@PathVariable Long taskId){
        return commentService.getForTask(taskId);
    }

    @PostMapping("/api/tasks/{taskId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse add(@PathVariable Long taskId, @Valid @RequestBody CommentRequest req){
        return commentService.add(taskId, req);
    }

    @DeleteMapping("/api/comments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id){
        commentService.delete(id);
    }
}
