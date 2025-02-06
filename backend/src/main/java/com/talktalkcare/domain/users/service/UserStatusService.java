package com.talktalkcare.domain.users.service;

import com.talktalkcare.domain.users.dto.FriendDto;
import com.talktalkcare.domain.users.entity.UserFriend;
import com.talktalkcare.domain.users.repository.UserFriendRepository;
import com.talktalkcare.domain.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Transactional
public class UserStatusService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final UserRepository userRepository;
    private final UserFriendRepository userFriendRepository;

    private static final String USER_STATUS_PREFIX = "user:status:";
    private static final String USER_LAST_ACTIVE_PREFIX = "user:lastActive:";

    // 기존 메서드들 유지...
    // 사용자 온라인 상태 설정
    public void setUserOnline(Integer userId) {
        redisTemplate.opsForValue().set(USER_STATUS_PREFIX + userId, "ONLINE");
        updateLastActiveTime(userId);
    }

    // 사용자 오프라인 상태 설정
    public void setUserOffline(Integer userId) {
        redisTemplate.opsForValue().set(USER_STATUS_PREFIX + userId, "OFFLINE");
        updateLastActiveTime(userId);
    }

    // 사용자의 온라인 상태 확인
    public boolean isUserOnline(Integer userId) {
        Object status = redisTemplate.opsForValue().get(USER_STATUS_PREFIX + userId);
        return "ONLINE".equals(status);
    }

    // 마지막 활동 시간 업데이트
    public void updateLastActiveTime(Integer userId) {
        redisTemplate.opsForValue().set(
                USER_LAST_ACTIVE_PREFIX + userId,
                LocalDateTime.now().toString(),
                24,
                TimeUnit.HOURS
        );
    }

    // 마지막 활동 시간 조회
    public LocalDateTime getLastActiveTime(Integer userId) {
        String time = (String) redisTemplate.opsForValue().get(USER_LAST_ACTIVE_PREFIX + userId);
        return time != null ? LocalDateTime.parse(time) : null;
    }

    // 친구 목록의 상태 정보 조회
    public List<FriendDto> getFriendsStatus(Integer userId) {
        List<FriendDto> friendsStatus = new ArrayList<>();
        List<Integer> friendIds = userFriendRepository.findFriendIdsByUserId(userId);

        for (Integer friendId : friendIds) {
            userRepository.findById(friendId).ifPresent(friend -> {
                boolean isOnline = isUserOnline(friendId);
                LocalDateTime lastActiveTime = getLastActiveTime(friendId);

                FriendDto friendDto = FriendDto.from(
                        friendId,
                        friend.getName(),
                        friend.getS3FileName(),
                        isOnline,
                        lastActiveTime
                );

                friendsStatus.add(friendDto);
            });
        }

        return friendsStatus;
    }

    // 특정 친구의 상태 정보 조회
    public FriendDto getFriendStatus(Integer friendId) {
        return userRepository.findById(friendId)
                .map(friend -> FriendDto.from(
                        friendId,
                        friend.getName(),
                        friend.getS3FileName(),
                        isUserOnline(friendId),
                        getLastActiveTime(friendId)
                ))
                .orElse(null);
    }

    // 모든 사용자의 상태 정보 초기화 (서버 재시작시 사용)
    public void resetAllUserStatus() {
        String pattern = USER_STATUS_PREFIX + "*";
        redisTemplate.delete(redisTemplate.keys(pattern));
    }

    // 비활성 사용자 정리 (24시간 이상 미접속)
    public void cleanupInactiveUsers() {
        String pattern = USER_LAST_ACTIVE_PREFIX + "*";
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24);

        redisTemplate.keys(pattern).forEach(key -> {
            String timeStr = (String) redisTemplate.opsForValue().get(key);
            if (timeStr != null) {
                LocalDateTime lastActive = LocalDateTime.parse(timeStr);
                if (lastActive.isBefore(cutoffTime)) {
                    String userId = key.replace(USER_LAST_ACTIVE_PREFIX, "");
                    redisTemplate.delete(USER_STATUS_PREFIX + userId);
                    redisTemplate.delete(key);
                }
            }
        });
    }

    @Transactional(readOnly = true)
    public List<Integer> getFriendIds(Integer userId) {
        return userFriendRepository.findFriendIdsByUserId(userId);
    }

    @Transactional
    public void addFriend(Integer userId, Integer friendId) {
        if (!userFriendRepository.existsByUserIdAndFriendId(userId, friendId)) {
            userRepository.findById(friendId).ifPresent(friend -> {
                UserFriend userFriend = new UserFriend(userId, friendId, friend.getName());
                userFriendRepository.save(userFriend);
            });
        }
    }

    @Transactional
    public void removeFriend(Integer userId, Integer friendId) {
        userFriendRepository.deleteByUserIdAndFriendId(userId, friendId);
    }
}