package com.talktalkcare.domain.users.service;

import com.talktalkcare.domain.users.converter.UserConverter;
import com.talktalkcare.domain.users.converter.UserSecurityConverter;
import com.talktalkcare.domain.users.dto.LoginDto;
import com.talktalkcare.domain.users.dto.ProfileImagReq;
import com.talktalkcare.domain.users.dto.ProfileImageResp;
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

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final S3Service s3Service;
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

        // 여기 이미지 업로드가 들어가야함

        userRepository.save(user);
        userSecurityRepository.save(userSecurity);
    }

    @Transactional
    public ProfileImageResp updateProfileImage(ProfileImagReq profileImagReq){
        User user = userRepository.findByLoginId(profileImagReq.getUserId())
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        try {
            String newFileName = s3Service.uploadFile(profileImagReq.getFile(), user.getS3FileName());
            user.setS3FileName(newFileName);
            return new ProfileImageResp(newFileName);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public User getUser(String userId) {
        return userRepository.findByLoginId(userId)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));
    }

    private String generateSalt() {
        return UUID.randomUUID().toString();
    }

    public void login(LoginDto request, HttpSession session, HttpServletResponse response) {

        authenticate(request.getUserLoginId(), request.getPassword());

        session.setAttribute("loginId", request.getUserLoginId());
        if (request.isAutoLogin()) {
            handleAutoLogin(request.getUserLoginId(), session, response);
        }
    }

    private void authenticate(String loginId, String password) {
        if(!userRepository.existsByLoginId(loginId)) {
            throw new UserException(UserErrorCode.USER_LOGINID_MISMATCH);
        }

        User user = getUser(loginId);

        UserSecurity userSecurity = userSecurityRepository.findById(loginId)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        String encryptedPassword = PasswordEncryptor.encryptPassword(password, userSecurity.getSalt());

        if(!user.getPassword().equals(encryptedPassword)){
            throw new UserException(UserErrorCode.USER_PASSWORD_MISMATCH);
        }
    }

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
        User user = getUser(loginId);
        user.setToken(token);
    }

    private Cookie createAutoLoginCookie(String token) {
        Cookie cookie = new Cookie("remember-me-token", token);
        cookie.setHttpOnly(true);
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7일
        cookie.setPath("/");
        return cookie;
    }
}
