
package com.example.taskmanager.controller;

import com.example.taskmanager.dto.UserProfileResponse;
import com.example.taskmanager.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping("/me")
    public UserProfileResponse getProfile() {
        return accountService.getProfile();
    }

    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAccount() {
        accountService.deleteAccount();
    }
}
