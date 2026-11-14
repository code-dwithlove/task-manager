package com.example.taskmanager.service;

import com.example.taskmanager.dto.TaskRequest;
import com.example.taskmanager.dto.TaskResponse;
import com.example.taskmanager.exception.ResourceNotFoundException;
import com.example.taskmanager.model.Project;
import com.example.taskmanager.model.Task;
import com.example.taskmanager.model.TaskStatus;
import com.example.taskmanager.model.User;
import com.example.taskmanager.repository.ProjectMemberRepository;
import com.example.taskmanager.repository.ProjectRepository;
import com.example.taskmanager.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock TaskRepository taskRepository;
    @Mock ProjectRepository projectRepository;
    @Mock ProjectMemberRepository memberRepository;
    @Mock CurrentUserService currentUser;
    @Mock ActivityService activityService;
    @Mock NotificationService notificationService;

    @InjectMocks TaskService taskService;

    private User me;
    private Project project;

    @BeforeEach
    void setUp() {
        me = new User();
        me.setId(1L);
        me.setName("Ann");

        project = new Project();
        project.setId(2L);
    }

    private Task task() {
        Task t = new Task();
        t.setId(5L);
        t.setTitle("Write tests");
        t.setStatus(TaskStatus.TODO);
        t.setProject(project);
        return t;
    }

    @Test
    void updateStatus_changesStatusAndLogsIt() {
        when(currentUser.get()).thenReturn(me);
        when(taskRepository.findAccessible(5L, 1L)).thenReturn(Optional.of(task()));
        when(taskRepository.save(any(Task.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        TaskResponse result = taskService.updateStatus(5L, TaskStatus.IN_PROGRESS);

        assertEquals(TaskStatus.IN_PROGRESS, result.status());
        verify(activityService).log(any(Project.class), anyString());
    }

    @Test
    void updateStatus_sameStatus_changesNothing() {
        when(currentUser.get()).thenReturn(me);
        when(taskRepository.findAccessible(5L, 1L)).thenReturn(Optional.of(task()));

        TaskResponse result = taskService.updateStatus(5L, TaskStatus.TODO);

        assertEquals(TaskStatus.TODO, result.status());
        verify(taskRepository, never()).save(any(Task.class));
        verify(activityService, never()).log(any(Project.class), anyString());
    }

    @Test
    void updateStatus_taskNotAccessible_throwsNotFound() {
        when(currentUser.get()).thenReturn(me);
        when(taskRepository.findAccessible(99L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> taskService.updateStatus(99L, TaskStatus.REVIEW));
    }

    @Test
    void create_assigneeNotInProject_throwsIllegalArgument() {
        when(currentUser.get()).thenReturn(me);
        when(projectRepository.findAccessible(2L, 1L)).thenReturn(Optional.of(project));
        when(memberRepository.findByProjectIdAndUserId(2L, 77L)).thenReturn(Optional.empty());

        TaskRequest req = new TaskRequest("New task", null, null, null, null, 77L);

        assertThrows(IllegalArgumentException.class, () -> taskService.create(2L, req));
        verify(taskRepository, never()).save(any(Task.class));
    }
}