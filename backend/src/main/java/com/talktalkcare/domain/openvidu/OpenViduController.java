package com.talktalkcare.domain.openvidu;

import io.openvidu.java.client.OpenVidu;
import io.openvidu.java.client.Session;
import io.openvidu.java.client.Connection;
import io.openvidu.java.client.ConnectionProperties;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class OpenViduController {

    private final OpenVidu openVidu;

    public OpenViduController() {
        // 도커 네트워크 내부에서는 http://openvidu:4443 사용
        this.openVidu = new OpenVidu("http://openvidu:4443", "talktalkcare");
    }

    @PostMapping("/sessions")
    public ResponseEntity<?> initializeSession() {
        try {
            Session session = openVidu.createSession();
            // JSON 객체로 응답
            Map<String, Object> response = new HashMap<>();
            response.put("id", session.getSessionId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/sessions/{sessionId}/connections")
    public ResponseEntity<?> createConnection(@PathVariable String sessionId) {
        try {
            Session session = openVidu.getActiveSession(sessionId);
            if (session == null) {
                return ResponseEntity.notFound().build();
            }

            ConnectionProperties properties = new ConnectionProperties.Builder().build();
            Connection connection = session.createConnection(properties);
            
            // JSON 객체로 응답
            Map<String, Object> response = new HashMap<>();
            response.put("token", connection.getToken());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}