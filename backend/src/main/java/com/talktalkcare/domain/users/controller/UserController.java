package com.talktalkcare.domain.users.controller;

import com.talktalkcare.common.response.Api;
import com.talktalkcare.domain.users.dto.*;
import com.talktalkcare.domain.users.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
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

    @PostMapping(value="/sign-up", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Api<Void> signUp(@ModelAttribute UserDto userDto) {
        userService.signUp(userDto);
        return Api.OK();
    }

    @PostMapping("/login")
    public Api<Void> login(@RequestBody LoginDto loginDto, HttpServletRequest request, HttpServletResponse response) {
        userService.login(loginDto, request.getSession(), response);
        return Api.OK();
    }

    @PostMapping(value="/upload-profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Api<ProfileImageResp> uploadProfileImage(ProfileImageReq profileImageReq) {
        return Api.OK(userService.updateProfileImage(profileImageReq));
    }

    @GetMapping("/profile-image")
    public Api<ProfileImageResp> getProfileImageUrl(@RequestParam(name = "userLoginId") String userLoginId) {
        return Api.OK(userService.getProfileImage(userLoginId));
    }

    @PostMapping("/add-friend")
    public Api<Void> addFriend(@RequestBody AddFriendReq addFriendReq) {
        userService.addFriend(addFriendReq);
        return Api.OK();
    }
}
