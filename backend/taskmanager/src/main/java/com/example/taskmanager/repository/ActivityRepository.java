package com.example.taskmanager.repository;

import com.example.taskmanager.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findTop50ByProjectIdOrderByCreatedAtDesc(Long projectId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("DELETE FROM Activity a WHERE a.actor.id = :userId")
    int deleteAllByActor(@Param("userId") Long userId);
}
