package com.example.taskmanager.repository;

import com.example.taskmanager.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findTop30ByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    long countByRecipientIdAndSeenFalse(Long recipientId);

    Optional<Notification> findByIdAndRecipientId(Long id, Long recipientId);

    @Modifying
    @Query("update Notification n set n.seen = true "
            + "where n.recipient.id = :userId and n.seen = false")
    int markAllSeen(@Param("userId") Long userId);

    void deleteByRecipientId(Long userId);
}