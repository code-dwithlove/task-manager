package com.example.taskmanager.service;

import com.example.taskmanager.dto.ProjectRequest;
import com.example.taskmanager.dto.ProjectResponse;
import com.example.taskmanager.exception.ResourceNotFoundException;
import com.example.taskmanager.model.Project;
import com.example.taskmanager.model.User;
import com.example.taskmanager.repository.ProjectRepository;
import com.example.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectResponse create(ProjectRequest req){
        User owner = userRepository.findById(1L)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Project project = new Project();
        project.setName(req.name());
        project.setDescription(req.description());
        project.setOwner(owner);
        return toResponse(projectRepository.save(project));
    }

    public List<ProjectResponse> getAll(){
        return projectRepository.findByOwnerId(1L).stream()
                .map(this::toResponse).toList();
    }

    public ProjectResponse update(Long id, ProjectRequest req){
        Project project = findOrThrow(id);
        project.setName(req.name());
        project.setDescription(req.description());
        return toResponse(projectRepository.save(project));
    }

    public void delete(Long id){
        projectRepository.delete(findOrThrow(id));
    }

    private Project findOrThrow(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    private ProjectResponse toResponse(Project p) {
        return new ProjectResponse(p.getId(), p.getName(), p.getDescription(), p.getCreatedAt());
    }
}
