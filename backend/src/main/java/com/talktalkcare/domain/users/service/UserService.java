package com.talktalkcare.domain.users.service;

import com.talktalkcare.domain.users.converter.UserConverter;
import com.talktalkcare.domain.users.converter.UserSecurityConverter;
import com.talktalkcare.domain.users.dto.LoginDto;
import com.talktalkcare.domain.users.dto.UserDto;
import com.talktalkcare.domain.users.entity.User;
import com.talktalkcare.domain.users.entity.UserSecurity;
import com.talktalkcare.domain.users.error.UserErrorCode;
import com.talktalkcare.domain.users.exception.UserException;
import com.talktalkcare.domain.users.repository.UserRepository;
import com.talktalkcare.domain.users.repository.UserSecurityRepository;
import com.talktalkcare.domain.users.utils.PasswordEncryptor;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserSecurityRepository userSecurityRepository;

    public void checkUserId(String userLoginId) {
        if(userRepository.existsByLoginId(userLoginId)) {
            throw new UserException(UserErrorCode.USER_ALREADY_EXISTS);
        }
    }

    @Transactional
    public void signUp(UserDto userDto) {
        String randomSalt = generateSalt();
        String rawPassword = userDto.getPassword();
        String encryptedPassword = PasswordEncryptor.encryptPassword(rawPassword,randomSalt);

        User user = UserConverter.dtoToEntity(userDto, encryptedPassword);
        UserSecurity userSecurity = UserSecurityConverter.toEntity(user, randomSalt);

        userRepository.save(user);
        userSecurityRepository.save(userSecurity);
    }

    private String generateSalt() {
        return UUID.randomUUID().toString();
    }

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
