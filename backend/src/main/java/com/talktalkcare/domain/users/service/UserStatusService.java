package com.talktalkcare.domain.users.service;

import com.talktalkcare.domain.users.repository.UserFriendRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class UserStatusService {
    private final RedisTemplate<String, String> redisTemplate;
    private final UserFriendRepository userFriendRepository;
    private static final String USER_STATUS_PREFIX = "user:status:";
    private static final long ONLINE_TIMEOUT = 300; // 5분

    public void updateUserStatus(String userId) {
        updateUserStatus(userId, true);
    }

    public void updateUserStatus(String userId, boolean isOnline) {
        String key = USER_STATUS_PREFIX + userId;
        if (isOnline) {
            redisTemplate.opsForValue().set(key, LocalDateTime.now().toString());
            redisTemplate.expire(key, ONLINE_TIMEOUT, TimeUnit.SECONDS);
        } else {
            // 오프라인 상태로 변경 시 마지막 접속 시간 저장
            redisTemplate.opsForValue().set(key, LocalDateTime.now().toString());
        }
    }

    public boolean isUserOnline(String userId) {
        String key = USER_STATUS_PREFIX + userId;
        return redisTemplate.hasKey(key);
    }

    public LocalDateTime getLastActiveTime(String userId) {
        String key = USER_STATUS_PREFIX + userId;
        String value = redisTemplate.opsForValue().get(key);
        return value != null ? LocalDateTime.parse(value) : null;
    }

    public List<String> getFriendIds(String userId) {
        return userFriendRepository.findFriendIdsByUserId(userId);
    }
}