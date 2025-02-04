package com.talktalkcare.domain.users.interceptor;

import com.talktalkcare.domain.users.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
@RequiredArgsConstructor
public class AutoLoginInterceptor implements HandlerInterceptor {

    private final UserService userService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            String loginId = null;
            String token = null;

            for (Cookie cookie : cookies) {
                if ("remember-me-id".equals(cookie.getName())) {
                    loginId = cookie.getValue();
                } else if ("remember-me-token".equals(cookie.getName())) {
                    token = cookie.getValue();
                }
            }

            if (loginId != null && token != null) {
                try {
                    userService.autoLogin(loginId, token, request.getSession());
                } catch (Exception e) {
                    log.error("자동 로그인 실패: {}", loginId, e);
                    deleteCookies(response);
                    return true;
                }
                return false;
            }
        }
        return true;
    }

    private void deleteCookies(HttpServletResponse response) {
        Cookie idCookie = new Cookie("remember-me-id", null);
        Cookie tokenCookie = new Cookie("remember-me-token", null);

        idCookie.setMaxAge(0);
        tokenCookie.setMaxAge(0);

        response.addCookie(idCookie);
        response.addCookie(tokenCookie);
    }
}
