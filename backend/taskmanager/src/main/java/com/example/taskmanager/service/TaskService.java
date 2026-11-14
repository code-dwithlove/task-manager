package com.example.taskmanager.service;

import com.example.taskmanager.dto.TaskRequest;
import com.example.taskmanager.dto.TaskResponse;
import com.example.taskmanager.exception.ResourceNotFoundException;
import com.example.taskmanager.model.*;
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
    private final CurrentUserService currentUser;
    private final ProjectMemberRepository memberRepository;
    private final ActivityService activityService;

    // Create a task inside one of MY projects
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
        activityService.log(project, "created task \""+ saved.getTitle() + "\"");
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getByProject(Long projectId,
                                           TaskStatus status, Priority priority) {
        findMyProject(projectId);   // throws 404 if the project is not mine

        return taskRepository.findByProjectId(projectId).stream()
                .filter(t -> status == null || t.getStatus() == status)
                .filter(t -> priority == null || t.getPriority() == priority)
                .map(this::toResponse)
                .toList();
    }

    // Edit a task
    public TaskResponse update(Long taskId, TaskRequest req) {
        Task task = findOrThrow(taskId);

        task.setTitle(req.title());
        task.setDescription(req.description());
        if (req.status() != null) task.setStatus(req.status());
        if (req.priority() != null) task.setPriority(req.priority());
        task.setDueDate(req.dueDate());
        if(req.assigneeId() != null){
            task.setAssignee(resolveAssignee(task.getProject().getId(), req.assigneeId()));
        }

        Task saved = taskRepository.save(task);
        activityService.log(saved.getProject(), "updated task \"" + saved.getTitle() + "\"");
        return toResponse(saved);
    }

    // Change only the status
    public TaskResponse updateStatus(Long taskId, TaskStatus newStatus) {
        Task task = findOrThrow(taskId);
        TaskStatus oldStatus = task.getStatus();
        if (oldStatus == newStatus) return toResponse(task);

        task.setStatus(newStatus);
        Task saved = taskRepository.save(task);
        activityService.log(saved.getProject(), "moved \"" + saved.getTitle() + "\" from " + label(oldStatus) + " to " + label(newStatus));
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
        return toResponse(saved);
    }

    // Delete a task
    public void delete(Long taskId) {
        Task task = findOrThrow(taskId);
        activityService.log(task.getProject(), "deleted task \"" + task.getTitle() + "\"");
        taskRepository.delete(task);
    }

    // ---------- helpers ----------

    // A project, but only if it belongs to the logged-in user
    private Project findMyProject(Long projectId) {
        return projectRepository
                .findAccessible(projectId, currentUser.get().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    // A task, but only if its project belongs to the logged-in user
    private Task findOrThrow(Long taskId) {
        return taskRepository
                .findAccessible(taskId, currentUser.get().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
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
                a == null ? null : a.getName()
        );
    }

    private User resolveAssignee(Long projectId, Long assigneeId){
        if(assigneeId == null) return null;
        return memberRepository.findByProjectIdAndUserId(projectId, assigneeId)
                .orElseThrow(() -> new IllegalArgumentException("Assignee must be a project member"))
                .getUser();
    }

    private String label(TaskStatus status) {
        return status.name().replace('_', ' ');
    }
}