package com.example.taskmanager.service;

import com.example.taskmanager.dto.ActivityResponse;
import com.example.taskmanager.model.Activity;
import com.example.taskmanager.model.Project;
import com.example.taskmanager.repository.ActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ActivityService {
    private final ActivityRepository activityRepository;
    private final CurrentUserService currentUserService;
    private final ProjectAccessService accessService;

    public void log(Project project, String message){
        Activity a = new Activity();
        a.setProject(project);
        a.setActor(currentUserService.get());
        a.setMessage(message);
        activityRepository.save(a);
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> getFeed(Long projectId){
        accessService.getAccessible(projectId);
        return activityRepository.findTop50ByProjectIdOrderByCreatedAtDesc(projectId).stream().map(a -> new ActivityResponse(a.getId(), a.getActor().getName(), a.getMessage(), a.getCreatedAt())).toList();
    }
}
