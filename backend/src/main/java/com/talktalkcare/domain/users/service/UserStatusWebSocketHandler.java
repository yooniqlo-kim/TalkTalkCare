package com.talktalkcare.domain.users.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talktalkcare.domain.users.dto.FriendDto;
import com.talktalkcare.domain.users.dto.StatusReq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class UserStatusWebSocketHandler extends TextWebSocketHandler {
    private final UserStatusService userStatusService;
    private final ObjectMapper objectMapper;
    private static final Map<String, Set<WebSocketSession>> userSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String userId = getUserIdFromSession(session);
        userSessions.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(session);
        userStatusService.updateUserStatus(userId);
        broadcastStatusChange(userId, true);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        StatusReq request = objectMapper.readValue(message.getPayload(), StatusReq.class);

        if ("GET_STATUS".equals(request.getType())) {
            List<FriendDto> statuses = request.getFriendIds().stream()
                    .map(friendId -> {
                        boolean isOnline = userStatusService.isUserOnline(friendId);
                        LocalDateTime lastActive = userStatusService.getLastActiveTime(friendId);
                        return FriendDto.from(friendId, isOnline, lastActive);
                    })
                    .collect(Collectors.toList());

            for (FriendDto status : statuses) {
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(status)));
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String userId = getUserIdFromSession(session);
        Set<WebSocketSession> sessions = userSessions.get(userId);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                userSessions.remove(userId);
                userStatusService.updateUserStatus(userId, false);
                broadcastStatusChange(userId, false);
            }
        }
    }

    private void broadcastStatusChange(String userId, boolean isOnline) {
        FriendDto statusChange = FriendDto.from(
                userId,
                isOnline,
                isOnline ? LocalDateTime.now() : userStatusService.getLastActiveTime(userId)
        );

        // 해당 유저의 친구들에게만 상태 변경 브로드캐스트
        userStatusService.getFriendIds(userId).forEach(friendId -> {
            Set<WebSocketSession> friendSessions = userSessions.get(friendId);
            if (friendSessions != null) {
                friendSessions.forEach(session -> {
                    try {
                        session.sendMessage(new TextMessage(
                                objectMapper.writeValueAsString(statusChange)
                        ));
                    } catch (IOException e) {
                        log.error("Failed to send status change to friend: " + friendId, e);
                    }
                });
            }
        });
    }

    private String getUserIdFromSession(WebSocketSession session) {
        // JWT 토큰이나 세션에서 사용자 ID 추출
        return session.getPrincipal().getName();
    }
}
