package com.example.taskmanager.controller;

import com.example.taskmanager.dto.NotificationResponse;
import com.example.taskmanager.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public List<NotificationResponse> mine() {
        return notificationService.mine();
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unread() {
        return Map.of("count", notificationService.unreadCount());
    }

    @PatchMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void read(@PathVariable Long id) {
        notificationService.markRead(id);
    }

    @PatchMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void readAll() {
        notificationService.markAllRead();
    }
}