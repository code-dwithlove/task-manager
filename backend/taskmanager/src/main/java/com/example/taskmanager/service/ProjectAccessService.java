package com.example.taskmanager.service;

import com.example.taskmanager.exception.ForbiddenException;
import com.example.taskmanager.exception.ResourceNotFoundException;
import com.example.taskmanager.model.Project;
import com.example.taskmanager.model.ProjectMember;
import com.example.taskmanager.model.ProjectRole;
import com.example.taskmanager.repository.ProjectMemberRepository;
import com.example.taskmanager.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProjectAccessService {
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final CurrentUserService currentUserService;

    public Project getAccessible(Long projectId) {
        return projectRepository.findAccessible(projectId, currentUserService.get().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    public void requireOwner(Long projectId){
        ProjectMember me = memberRepository.findByProjectIdAndUserId(projectId, currentUserService.get().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if(me.getRole() != ProjectRole.OWNER){
            throw new ForbiddenException("Only the project owner can do this");
        }
    }
}
