package com.talktalkcare.domain.users.error;

import com.talktalkcare.common.error.ErrorCodeInterface;

public enum UserErrorCode implements ErrorCodeInterface {

    HASH_ALGORITHM_NOT_FOUND(500, 1000, "HashAlgorithmNotFoundException occurred"),
    USER_ALREADY_EXISTS(400, 1001, "이미 가입된 사용자입니다."),
    USER_OTP_EXPIRED(400, 1002, "인증번호가 만료되었습니다."),
    USER_OTP_MISMATCH(400, 1003, "인증번호가 일치하지 않습니다.");

    private final Integer httpStatusCode;
    private final Integer errorCode;
    private final String message;

    UserErrorCode(Integer httpStatusCode, Integer errorCode, String message) {
        this.httpStatusCode = httpStatusCode;
        this.errorCode = errorCode;
        this.message = message;
    }

    @Override
    public Integer getHttpStatusCode() {
        return this.httpStatusCode;
    }

    @Override
    public Integer getErrorCode() {
        return this.errorCode;
    }

    @Override
    public String getMessage() {
        return this.message;
    }

}
