package com.talktalkcare.domain.users.controller;

import com.talktalkcare.common.response.Api;
import com.talktalkcare.domain.users.dto.LoginDto;
import com.talktalkcare.domain.users.dto.UserDto;
import com.talktalkcare.domain.users.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @GetMapping("/check-id")
    public Api<Void> checkUserId(@RequestParam(name = "userLoginId") String userLoginId) {
        userService.checkUserId(userLoginId);
        return Api.OK();
    }

    @PostMapping("/sign-up")
    public Api<Void> signUp(@RequestBody UserDto userDto) {
        userService.signUp(userDto);
        return Api.OK();
    }

    @PostMapping("/login")
    public Api<Void> login(@RequestBody LoginDto request, HttpSession session, HttpServletResponse response) {
        userService.login(request, session, response);
        return Api.OK();
    }
    
}
