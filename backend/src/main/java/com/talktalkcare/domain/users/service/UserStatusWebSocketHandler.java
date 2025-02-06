package com.talktalkcare.domain.users.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talktalkcare.domain.users.dto.StatusReq;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class UserStatusWebSocketHandler extends TextWebSocketHandler {

    private final UserStatusService userStatusService;
    private final ObjectMapper objectMapper;
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(@NotNull WebSocketSession session) {
        String userId = extractUserId(session);
        sessions.put(userId, session);
        userStatusService.setUserOnline(Integer.parseInt(userId));
    }

    @Override
    protected void handleTextMessage(@NotNull WebSocketSession session, TextMessage message) throws Exception {
        StatusReq statusReq = objectMapper.readValue(message.getPayload(), StatusReq.class);
        // 친구들의 상태 정보를 조회하고 응답
    }

    @Override
    public void afterConnectionClosed(@NotNull WebSocketSession session, @NotNull CloseStatus status) {
        String userId = extractUserId(session);
        sessions.remove(userId);

        userStatusService.setUserOffline(Integer.parseInt(userId));
    }

    private String extractUserId(WebSocketSession session) {
        // 세션에서 사용자 ID를 추출하는 로직
        return session.getAttributes().get("userId").toString();
    }
}