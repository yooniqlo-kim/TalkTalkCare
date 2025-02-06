package com.talktalkcare.domain.users.controller;

import com.talktalkcare.common.response.Api;
import com.talktalkcare.domain.users.dto.AddFriendReq;
import com.talktalkcare.domain.users.service.UserFriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/friends")
public class UserFriendController {

    private final UserFriendService userFriendService;

    @PostMapping("/add-friend")
    public Api<Void> addFriend(@RequestBody AddFriendReq addFriendReq) {
        userFriendService.addFriend(addFriendReq);
        return Api.OK();
    }
}
