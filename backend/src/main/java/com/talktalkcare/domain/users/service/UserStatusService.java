package com.talktalkcare.domain.users.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class UserStatusService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String USER_STATUS_PREFIX = "user:status:";
    private static final String USER_LAST_ACTIVE_PREFIX = "user:lastActive:";

    public void setUserOnline(Integer userId) {
        redisTemplate.opsForValue().set(USER_STATUS_PREFIX + userId, "ONLINE");
        updateLastActiveTime(userId);
    }

    public void setUserOffline(Integer userId) {
        redisTemplate.opsForValue().set(USER_STATUS_PREFIX + userId, "OFFLINE");
        updateLastActiveTime(userId);
    }

    public boolean isUserOnline(Integer userId) {
        Object status = redisTemplate.opsForValue().get(USER_STATUS_PREFIX + userId);
        return "ONLINE".equals(status);
    }

    public void updateLastActiveTime(Integer userId) {
        redisTemplate.opsForValue().set(
                USER_LAST_ACTIVE_PREFIX + userId,
                LocalDateTime.now().toString(),
                24,
                TimeUnit.HOURS
        );
    }

    public LocalDateTime getLastActiveTime(Integer userId) {
        String time = (String) redisTemplate.opsForValue().get(USER_LAST_ACTIVE_PREFIX + userId);
        return time != null ? LocalDateTime.parse(time) : null;
    }
}