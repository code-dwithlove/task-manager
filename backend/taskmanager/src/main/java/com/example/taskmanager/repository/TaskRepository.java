package com.example.taskmanager.repository;

import com.example.taskmanager.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);

    @Query("select t from Task t where t.id = :id and exists ("
            + "select 1 from ProjectMember m "
            + "where m.project = t.project and m.user.id = :userId)")
    Optional<Task> findAccessible(@Param("id") Long id, @Param("userId") Long userId);
}
