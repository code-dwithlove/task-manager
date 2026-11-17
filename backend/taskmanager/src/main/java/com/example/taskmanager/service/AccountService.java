
package com.example.taskmanager.service;

import com.example.taskmanager.dto.UserProfileResponse;
import com.example.taskmanager.model.Project;
import com.example.taskmanager.model.User;
import com.example.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;
    private final CommentRepository commentRepository;
    private final ActivityRepository activityRepository;
    private final NotificationRepository notificationRepository;

    public UserProfileResponse getProfile() {
        User user = currentUserService.get();

        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCreatedAt()
        );
    }

    @Transactional
    public void deleteAccount() {

        User user = currentUserService.get();
        Long userId = user.getId();

        // Remove references to this user in other users' tasks.
        taskRepository.clearAssigneeForUser(userId);

        // Remove records created by this user.
        commentRepository.deleteByAuthorId(userId);
        activityRepository.deleteByActorId(userId);
        notificationRepository.deleteByRecipientId(userId);

        // Remove memberships in other users' projects.
        projectMemberRepository.deleteByUserId(userId);

        // Delete projects owned by this user.
        // Project has REMOVE cascades for tasks, members and activities.
        List<Project> ownedProjects =
                projectRepository.findByOwnerId(userId);

        projectRepository.deleteAll(ownedProjects);

        // Finally delete the user.
        userRepository.delete(user);
    }
}
