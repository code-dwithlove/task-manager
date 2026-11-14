package com.example.taskmanager.service;

import com.example.taskmanager.dto.TaskRequest;
import com.example.taskmanager.dto.TaskResponse;
import com.example.taskmanager.exception.ResourceNotFoundException;
import com.example.taskmanager.model.Priority;
import com.example.taskmanager.model.Project;
import com.example.taskmanager.model.Task;
import com.example.taskmanager.model.TaskStatus;
import com.example.taskmanager.model.User;
import com.example.taskmanager.repository.ProjectMemberRepository;
import com.example.taskmanager.repository.ProjectRepository;
import com.example.taskmanager.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final CurrentUserService currentUser;
    private final ActivityService activityService;
    private final NotificationService notificationService;

    public TaskResponse create(Long projectId, TaskRequest req) {
        Project project = findMyProject(projectId);

        Task task = new Task();
        task.setTitle(req.title());
        task.setDescription(req.description());
        if (req.status() != null) task.setStatus(req.status());
        if (req.priority() != null) task.setPriority(req.priority());
        task.setDueDate(req.dueDate());
        task.setProject(project);
        task.setAssignee(resolveAssignee(projectId, req.assigneeId()));

        Task saved = taskRepository.save(task);
        activityService.log(project, "created task \"" + saved.getTitle() + "\"");
        if (saved.getAssignee() != null) {
            notificationService.notifyUser(saved.getAssignee(),
                    currentUser.get().getName() + " assigned you \""
                            + saved.getTitle() + "\"", projectId);
        }
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getByProject(Long projectId,
                                           TaskStatus status, Priority priority) {
        findMyProject(projectId);

        return taskRepository.findByProjectId(projectId).stream()
                .filter(t -> status == null || t.getStatus() == status)
                .filter(t -> priority == null || t.getPriority() == priority)
                .map(this::toResponse)
                .toList();
    }

    public TaskResponse update(Long taskId, TaskRequest req) {
        Task task = findOrThrow(taskId);

        task.setTitle(req.title());
        task.setDescription(req.description());
        if (req.status() != null) task.setStatus(req.status());
        if (req.priority() != null) task.setPriority(req.priority());
        task.setDueDate(req.dueDate());
        if (req.assigneeId() != null) {
            task.setAssignee(resolveAssignee(task.getProject().getId(), req.assigneeId()));
        }

        Task saved = taskRepository.save(task);
        activityService.log(saved.getProject(), "updated task \"" + saved.getTitle() + "\"");
        return toResponse(saved);
    }

    public TaskResponse updateStatus(Long taskId, TaskStatus newStatus) {
        Task task = findOrThrow(taskId);
        TaskStatus oldStatus = task.getStatus();
        if (oldStatus == newStatus) return toResponse(task);

        task.setStatus(newStatus);
        Task saved = taskRepository.save(task);
        activityService.log(saved.getProject(),
                "moved \"" + saved.getTitle() + "\" from "
                        + label(oldStatus) + " to " + label(newStatus));
        // tell the assignee (skipped automatically if the assignee is me)
        notificationService.notifyUser(saved.getAssignee(),
                currentUser.get().getName() + " moved \"" + saved.getTitle()
                        + "\" to " + label(newStatus), saved.getProject().getId());
        return toResponse(saved);
    }

    public TaskResponse assign(Long taskId, Long userId) {
        Task task = findOrThrow(taskId);
        User assignee = resolveAssignee(task.getProject().getId(), userId);
        task.setAssignee(assignee);

        Task saved = taskRepository.save(task);
        String text = assignee == null
                ? "unassigned \"" + saved.getTitle() + "\""
                : "assigned \"" + saved.getTitle() + "\" to " + assignee.getName();
        activityService.log(saved.getProject(), text);
        notificationService.notifyUser(assignee,
                currentUser.get().getName() + " assigned you \""
                        + saved.getTitle() + "\"", saved.getProject().getId());
        return toResponse(saved);
    }

    public void delete(Long taskId) {
        Task task = findOrThrow(taskId);
        activityService.log(task.getProject(), "deleted task \"" + task.getTitle() + "\"");
        taskRepository.delete(task);
    }

    // ---------- helpers ----------

    private Project findMyProject(Long projectId) {
        return projectRepository
                .findAccessible(projectId, currentUser.get().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    private Task findOrThrow(Long taskId) {
        return taskRepository
                .findAccessible(taskId, currentUser.get().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    }

    private User resolveAssignee(Long projectId, Long assigneeId) {
        if (assigneeId == null) return null;
        return memberRepository.findByProjectIdAndUserId(projectId, assigneeId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Assignee must be a project member"))
                .getUser();
    }

    private String label(TaskStatus status) {
        return status.name().replace('_', ' ');
    }

    private TaskResponse toResponse(Task t) {
        User a = t.getAssignee();
        return new TaskResponse(
                t.getId(),
                t.getTitle(),
                t.getDescription(),
                t.getStatus(),
                t.getPriority(),
                t.getDueDate(),
                t.getProject().getId(),
                a == null ? null : a.getId(),
                a == null ? null : a.getName());
    }
}