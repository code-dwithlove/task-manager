package com.example.taskmanager.repository;

import com.example.taskmanager.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTaskIdOrderByCreatedAtAsc(Long taskId);
    Optional<Comment> findByIdAndAuthorId(Long id, Long authorId);
    void deleteByAuthorId(Long userId);
}
