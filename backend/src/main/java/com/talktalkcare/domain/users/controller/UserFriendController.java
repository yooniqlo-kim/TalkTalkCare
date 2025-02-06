package com.talktalkcare.domain.users.controller;

import com.talktalkcare.common.response.Api;
import com.talktalkcare.domain.users.dto.AddFriendReq;
import com.talktalkcare.domain.users.dto.FriendDto;
import com.talktalkcare.domain.users.service.UserFriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/friends")
public class UserFriendController {
    private final UserFriendService userFriendService;

    // 친구 목록 조회
    @GetMapping("/{userId}")
    public Api<List<FriendDto>> getFriends(@PathVariable Integer userId) {
        List<FriendDto> friends = userFriendService.getFriendsStatus(userId);
        return Api.OK(friends);
    }

    // 친구 추가
    @PostMapping("/add-friend")
    public Api<Void> addFriend(@RequestBody AddFriendReq request) {
        userFriendService.addFriend(request);
        return Api.OK();
    }

    // 친구 삭제
    @DeleteMapping("/{userId}/{friendId}")
    public Api<Void> removeFriend(
            @PathVariable Integer userId,
            @PathVariable Integer friendId
    ) {
        userFriendService.removeFriend(userId, friendId);
        return Api.OK();
    }

    // 친구 상태 조회
    @GetMapping("/status/{friendId}")
    public Api<FriendDto> getFriendStatus(@PathVariable Integer friendId) {
        FriendDto friend = userFriendService.getFriendStatus(friendId);
        return Api.OK(friend);
    }
}
