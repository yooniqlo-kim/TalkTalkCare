package com.talktalkcare.domain.users.service;

import com.talktalkcare.domain.users.dto.LoginDto;
import com.talktalkcare.domain.users.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public void login(LoginDto request, HttpSession session, HttpServletResponse response) {
        // 인증 로직
//        if (!authenticate(request.getUserLoginId(), request.getPassword())) {
//            //throw new AuthenticationException("로그인 실패");
//        }

        // 세션에 기본 정보 저장
        session.setAttribute("loginId", request.getUserLoginId());
        // 자동 로그인 처리
        if (request.isAutoLogin()) {
            handleAutoLogin(request.getUserLoginId(), session, response);
        }
    }

//    private boolean authenticate(String loginId, String password) {
//        return userRepository.findByLoginId(loginId)
//                .map(user -> passwordEncoder.matches(password, user.getPassword()))
//                .orElse(false);
//    }

    private void handleAutoLogin(String loginId, HttpSession session, HttpServletResponse response) {
        String token = createAutoLoginToken(loginId);
        storeTokenInDatabase(loginId, token);

        session.setAttribute("autoLoginToken", token);

        Cookie cookie = createAutoLoginCookie(token);
        response.addCookie(cookie);
    }

    private String createAutoLoginToken(String loginId) {
        return UUID.randomUUID().toString();
    }

    private void storeTokenInDatabase(String loginId, String token) {
        // 토큰 저장 로직
    }

    private Cookie createAutoLoginCookie(String token) {
        Cookie cookie = new Cookie("remember-me-token", token);
        cookie.setHttpOnly(true);
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7일
        cookie.setPath("/");
        return cookie;
    }
}
