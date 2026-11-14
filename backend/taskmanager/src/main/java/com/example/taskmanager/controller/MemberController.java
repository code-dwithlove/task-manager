package com.example.taskmanager.controller;

import com.example.taskmanager.dto.AddMemberRequest;
import com.example.taskmanager.dto.MemberResponse;
import com.example.taskmanager.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/members")
@RequiredArgsConstructor
public class MemberController {
    private final MemberService memberService;

    @GetMapping
    public List<MemberResponse> list(@PathVariable Long projectId){
        return memberService.list(projectId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MemberResponse add(@PathVariable Long projectId, @Valid @RequestBody AddMemberRequest req){
        return memberService.add(projectId, req);
    }

    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable Long projectId, @PathVariable Long userId){
        memberService.remove(projectId, userId);
    }
}
