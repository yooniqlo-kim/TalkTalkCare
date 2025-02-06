package com.talktalkcare.domain.users.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talktalkcare.domain.users.dto.FriendDto;
import lombok.RequiredArgsConstructor;
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
public class UserStatusWebSocketHandler extends TextWebSocketHandler {

    private final UserFriendService userFriendService;
    private final ObjectMapper objectMapper;
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String userId = extractUserId(session);
        sessions.put(userId, session);
        userFriendService.setUserOnline(Integer.parseInt(userId));
        broadcastStatusChange(Integer.parseInt(userId), true);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String userId = extractUserId(session);
        List<FriendDto> friendsStatus = userFriendService.getFriendsStatus(Integer.parseInt(userId));
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(friendsStatus)));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String userId = extractUserId(session);
        sessions.remove(userId);
        userFriendService.setUserOffline(Integer.parseInt(userId));
        broadcastStatusChange(Integer.parseInt(userId), false);
    }

    private void broadcastStatusChange(Integer userId, boolean isOnline) {
        List<Integer> friendIds = userFriendService.getFriendIds(userId);
        for (Integer friendId : friendIds) {
            WebSocketSession friendSession = sessions.get(friendId.toString());
            if (friendSession != null && friendSession.isOpen()) {
                try {
                    FriendDto statusUpdate = userFriendService.getFriendStatus(userId);
                    friendSession.sendMessage(new TextMessage(objectMapper.writeValueAsString(statusUpdate)));
                } catch (Exception e) {
                    // 로그 처리
                }
            }
        }
    }

    private String extractUserId(WebSocketSession session) {
        return session.getAttributes().get("userId").toString();
    }
}