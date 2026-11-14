package com.example.taskmanager.service;

import com.example.taskmanager.dto.AddMemberRequest;
import com.example.taskmanager.dto.MemberResponse;
import com.example.taskmanager.exception.ResourceNotFoundException;
import com.example.taskmanager.model.Project;
import com.example.taskmanager.model.ProjectMember;
import com.example.taskmanager.model.ProjectRole;
import com.example.taskmanager.model.User;
import com.example.taskmanager.repository.ProjectMemberRepository;
import com.example.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberService {
    private final ProjectMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final ProjectAccessService accessService;
    private final ActivityService activityService;

    @Transactional(readOnly = true)
    public List<MemberResponse> list(Long projectId){
        accessService.getAccessible(projectId);
        return memberRepository.findByProjectId(projectId).stream().map(this::toResponse).toList();
    }

    public MemberResponse add(Long projectId, AddMemberRequest req){
        Project project = accessService.getAccessible(projectId);
        accessService.requireOwner(projectId);
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new ResourceNotFoundException("No user with that email"));
        if(memberRepository.existsByProjectIdAndUserId(projectId, user.getId())){
            throw new IllegalArgumentException("User is already a member");
        }
        ProjectMember m = new ProjectMember();
        m.setProject(project);
        m.setUser(user);
        m.setRole(ProjectRole.MEMBER);

        MemberResponse response = toResponse(memberRepository.save(m));
        activityService.log(project, "added " +user.getName() + " to the project");
        return response;
    }

    public void remove(Long projectId, Long userId){
        Project project = accessService.getAccessible(projectId);
        accessService.requireOwner(projectId);

        ProjectMember member = memberRepository
                .findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        if (member.getRole() == ProjectRole.OWNER) {
            throw new IllegalArgumentException("The owner cannot be removed");
        }
        String name = member.getUser().getName();
        memberRepository.delete(member);
        activityService.log(project, "removed " + name + " from the project");
    }

    private MemberResponse toResponse(ProjectMember m) {
        return new MemberResponse(
                m.getUser().getId(),
                m.getUser().getName(),
                m.getUser().getEmail(),
                m.getRole()
        );
    }
}
