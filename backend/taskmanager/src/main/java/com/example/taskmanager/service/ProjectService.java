package com.example.taskmanager.service;

import com.example.taskmanager.dto.ProjectRequest;
import com.example.taskmanager.dto.ProjectResponse;
import com.example.taskmanager.exception.ResourceNotFoundException;
import com.example.taskmanager.model.Project;
import com.example.taskmanager.model.ProjectMember;
import com.example.taskmanager.model.ProjectRole;
import com.example.taskmanager.model.User;
import com.example.taskmanager.repository.ProjectMemberRepository;
import com.example.taskmanager.repository.ProjectRepository;
import com.example.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final CurrentUserService currentUserService;
    private final ProjectMemberRepository memberRepository;
    private final ProjectAccessService accessService;
    public final ActivityService activityService;

    public ProjectResponse create(ProjectRequest req) {
        User me = currentUserService.get();

        Project project = new Project();
        project.setName(req.name());
        project.setDescription(req.description());
        project.setOwner(me);
        Project saved = projectRepository.save(project);

        ProjectMember member = new ProjectMember();
        member.setProject(saved);
        member.setUser(me);
        member.setRole(ProjectRole.OWNER);
        memberRepository.save(member);

        activityService.log(saved, "created the project");
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getAll(){
        return projectRepository.findAllForUser(currentUserService.get().getId()).stream()
                .map(this::toResponse).toList();
    }

    public ProjectResponse update(Long id, ProjectRequest req){
        Project project = accessService.getAccessible(id);
        accessService.requireOwner(id);
        project.setName(req.name());
        project.setDescription(req.description());
        return toResponse(projectRepository.save(project));
    }

    public void delete(Long id){
        Project project = accessService.getAccessible(id);
        accessService.requireOwner(id);
        projectRepository.delete(project);
    }

    private ProjectResponse toResponse(Project p) {
        return new ProjectResponse(p.getId(), p.getName(), p.getDescription(), p.getCreatedAt());
    }
}
