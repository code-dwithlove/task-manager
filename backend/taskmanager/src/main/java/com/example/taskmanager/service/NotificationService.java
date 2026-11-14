package com.example.taskmanager.service;

import com.example.taskmanager.dto.NotificationResponse;
import com.example.taskmanager.exception.ResourceNotFoundException;
import com.example.taskmanager.model.Notification;
import com.example.taskmanager.model.User;
import com.example.taskmanager.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final CurrentUserService currentUser;

    // Called by the other services. Never notifies you about your own actions.
    public void notifyUser(User recipient, String message, Long projectId) {
        if (recipient == null) return;
        if (recipient.getId().equals(currentUser.get().getId())) return;

        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setMessage(message);
        n.setProjectId(projectId);
        notificationRepository.save(n);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> mine() {
        return notificationRepository
                .findTop30ByRecipientIdOrderByCreatedAtDesc(currentUser.get().getId())
                .stream()
                .map(n -> new NotificationResponse(n.getId(), n.getMessage(),
                        n.getProjectId(), n.isSeen(), n.getCreatedAt()))
                .toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount() {
        return notificationRepository
                .countByRecipientIdAndSeenFalse(currentUser.get().getId());
    }

    public void markRead(Long id) {
        Notification n = notificationRepository
                .findByIdAndRecipientId(id, currentUser.get().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        n.setSeen(true);   // saved automatically when the transaction ends
    }

    public void markAllRead() {
        notificationRepository.markAllSeen(currentUser.get().getId());
    }
}