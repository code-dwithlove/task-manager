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

        return toResponse(taskRepository.save(task));
    }

    // List the tasks of one of MY projects, with optional filters
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

        return toResponse(taskRepository.save(task));
    }

    // Change only the status
    public TaskResponse updateStatus(Long taskId, TaskStatus newStatus) {
        Task task = findOrThrow(taskId);
        task.setStatus(newStatus);
        return toResponse(taskRepository.save(task));
    }

    // Delete a task
    public void delete(Long taskId) {
        taskRepository.delete(findOrThrow(taskId));
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

    public TaskResponse assign(Long taskId, Long userId){
        Task task = findOrThrow(taskId);
        task.setAssignee(resolveAssignee(task.getProject().getId(), userId));
        return toResponse(taskRepository.save(task));
    }
}