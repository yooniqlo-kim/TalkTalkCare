package com.talktalkcare.domain.users.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talktalkcare.domain.users.dto.FriendDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserStatusWebSocketHandler extends TextWebSocketHandler {

    private final FriendService friendService;
    private final ObjectMapper objectMapper;
    private final Map<Integer, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Integer userId = extractUserId(session);
        if (userId != null) {
            if (!sessions.containsKey(userId)) {
                sessions.put(userId, session);
                log.info("WebSocket 연결 성공 - userId: {}", userId);
            }
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            Integer userId = extractUserId(session);
            List<FriendDto> friendsStatus = friendService.getFriendsStatus(userId);
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(friendsStatus)));
            log.info("메시지 처리 성공 - userId: {}", userId);
        } catch (Exception e) {
            log.error("메시지 처리 중 에러 발생", e);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Integer userId = extractUserId(session);
        if (userId != null) {
            sessions.remove(userId);
            log.info("WebSocket 연결 종료 - userId: {}", userId);
        }
    }

    private Integer extractUserId(WebSocketSession session) {
        try {
            String query = session.getUri().getQuery();
            return Integer.valueOf(query.split("=")[1]);
        } catch (Exception e) {
            log.error("userId 추출 중 에러 발생", e);
            return null;
        }
    }
}