package com.example.taskmanager.service;

import com.example.taskmanager.model.Project;
import com.example.taskmanager.repository.ActivityRepository;
import com.example.taskmanager.repository.CommentRepository;
import com.example.taskmanager.repository.NotificationRepository;
import com.example.taskmanager.repository.ProjectMemberRepository;
import com.example.taskmanager.repository.ProjectRepository;
import com.example.taskmanager.repository.TaskRepository;
import com.example.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final CommentRepository commentRepository;
    private final ActivityRepository activityRepository;
    private final NotificationRepository notificationRepository;
    private final ProjectMemberRepository projectMemberRepository;

    @Transactional
    public void deleteCurrentUser() {
        Long userId = currentUserService.get().getId();

        // 1. Projects this user owns. Cascade removes their tasks, comments,
        //    members and activities.
        List<Project> owned = projectRepository.findByOwnerId(userId);
        projectRepository.deleteAll(owned);
        projectRepository.flush();

        // 2. Leftovers in projects owned by other people
        taskRepository.unassignUser(userId);
        commentRepository.deleteAllByAuthor(userId);
        activityRepository.deleteAllByActor(userId);
        notificationRepository.deleteAllByRecipient(userId);
        projectMemberRepository.deleteAllByUser(userId);

        // 3. Finally the user
        userRepository.deleteById(userId);
    }
}