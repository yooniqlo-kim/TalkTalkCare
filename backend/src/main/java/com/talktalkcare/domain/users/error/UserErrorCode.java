package com.talktalkcare.domain.users.error;

import com.talktalkcare.common.error.ErrorCodeInterface;

public enum UserErrorCode implements ErrorCodeInterface {

    HASH_ALGORITHM_NOT_FOUND(500, 1001, "HashAlgorithmNotFoundException occurred");;

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
