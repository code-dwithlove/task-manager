package com.example.taskmanager.repository;

import com.example.taskmanager.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    @Query("select m.project from ProjectMember m where m.user.id = :userId")
    List<Project> findAllForUser(@Param("userId") Long userId);

    @Query("select m.project from ProjectMember m " + "where m.project.id = :id and m.user.id = :userId")
    Optional<Project> findAccessible(@Param("id") Long id, @Param("userId") Long userId);

    List<Project> findByOwnerId(Long ownerId);
}
