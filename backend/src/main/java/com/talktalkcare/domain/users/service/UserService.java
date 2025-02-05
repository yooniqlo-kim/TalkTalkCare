package com.talktalkcare.domain.users.service;

import com.talktalkcare.domain.users.converter.UserConverter;
import com.talktalkcare.domain.users.converter.UserSecurityConverter;
import com.talktalkcare.domain.users.dto.*;
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

        String uploadedFileName;
        try{
            uploadedFileName = s3Service.uploadFile(userDto.getS3Filename(), null);
        } catch (IOException e) {
            throw new UserException(UserErrorCode.UPLOAD_IMAGE_FAILED);
        }

        user.setS3FileName(uploadedFileName);

        userRepository.save(user);
        userSecurityRepository.save(userSecurity);
    }

    @Transactional
    public ProfileImageResp updateProfileImage(ProfileImageReq profileImageReq){
        User user = getUser(profileImageReq.getUserId());

        try {
            String newFileName = s3Service.uploadFile(profileImageReq.getFile(), user.getS3FileName());
            user.setS3FileName(newFileName);
            return new ProfileImageResp(newFileName);
        } catch (IOException e) {
            throw new UserException(UserErrorCode.UPLOAD_IMAGE_FAILED);
        }
    }

    public User getUser(String userId) {
        return userRepository.findByLoginId(userId)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));
    }

    private String generateSalt() {
        return UUID.randomUUID().toString();
    }

    @Transactional
    public void login(LoginDto request, HttpSession session, HttpServletResponse response) {
        String userLoginId = request.getUserLoginId();

        authenticate(userLoginId, request.getPassword());

        userRepository.setUserLoginedAt(userLoginId);

        session.setAttribute("loginUser", userLoginId);

        if (request.isAutoLogin()) {
            handleAutoLogin(userLoginId, session, response);
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

        Cookie tokenCookie = new Cookie("remember-me-token",token);
        Cookie idCookie = new Cookie("remember-me-id", loginId);

        settingCookie(tokenCookie);
        settingCookie(idCookie);

        response.addCookie(tokenCookie);
        response.addCookie(idCookie);
    }

    private String createAutoLoginToken(String loginId) {
        return PasswordEncryptor.encryptPassword(loginId,generateSalt());
    }

    private void storeTokenInDatabase(String loginId, String token) {
        User user = getUser(loginId);
        user.setToken(token);
    }

    private void settingCookie(Cookie cookie) {
        cookie.setHttpOnly(true);
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7일
        cookie.setPath("/");
    }

    @Transactional
    public void autoLogin(String loginId, String token, HttpSession session) {
        User user = getUser(loginId);

        if (!user.getToken().equals(token)) {
            throw new UserException(UserErrorCode.USER_TOKEN_INVALID);
        }

        session.setAttribute("loginUser", user.getLoginId());
    }

    public ProfileImageResp getProfileImage(String userLoginId) {
        User user = getUser(userLoginId);
        return s3Service.getFileUrl(user.getS3FileName());
    }

    @Transactional
    public void addFriend(AddFriendReq addFriendReq) {
        User friend = userRepository.findByPhone(addFriendReq.getPhone())
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));



    }
}
