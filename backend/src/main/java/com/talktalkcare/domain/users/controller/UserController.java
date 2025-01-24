package com.talktalkcare.domain.users.controller;

import com.talktalkcare.common.response.Api;
import com.talktalkcare.domain.users.dto.LoginDto;
import com.talktalkcare.domain.users.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @PostMapping("/login")
    public Api<Void> login(
            @RequestBody LoginDto request,
            HttpSession session,
            HttpServletResponse response) {

        userService.login(request, session, response);
        return Api.OK();
    }
    
}
