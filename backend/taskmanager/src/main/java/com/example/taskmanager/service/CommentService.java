package com.example.taskmanager.service;

import com.example.taskmanager.dto.CommentRequest;
import com.example.taskmanager.dto.CommentResponse;
import com.example.taskmanager.exception.ResourceNotFoundException;
import com.example.taskmanager.model.Comment;
import com.example.taskmanager.model.Task;
import com.example.taskmanager.repository.CommentRepository;
import com.example.taskmanager.repository.TaskRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {
    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final CurrentUserService currentUserService;
    private final ActivityService activityService;

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<CommentResponse> getForTask(Long taskId){
        findTask(taskId);
        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId)
                .stream().map(this::toResponse).toList();
    }

    public CommentResponse add(Long taskId, CommentRequest req){
        Task task = findTask(taskId);

        Comment comment = new Comment();
        comment.setText(req.text());
        comment.setTask(task);
        comment.setAuthor(currentUserService.get());
        Comment saved = commentRepository.save(comment);

        activityService.log(task.getProject(), "commented on \"" + task.getTitle() + "\"");
        return toResponse(saved);
    }

    public void delete(Long commentId){
        Comment comment = commentRepository.findByIdAndAuthorId(commentId, currentUserService.get().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Comment Not Found"));
        commentRepository.delete(comment);
    }

    private Task findTask(Long taskId) {
        return taskRepository.findAccessible(taskId, currentUserService.get().getId()).orElseThrow(() -> new ResourceNotFoundException("Task Not Found"));
    }

    private CommentResponse toResponse(Comment c){
        return new CommentResponse(c.getId(), c.getText(), c.getAuthor().getName(), c.getAuthor().getEmail(), c.getCreatedAt());
    }

}
