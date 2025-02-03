package com.talktalkcare.domain.dementia.error;

import com.talktalkcare.common.error.ErrorCodeInterface;

public enum DementiaTestErrorCode implements ErrorCodeInterface {

    API_CONNECTION_FAILED(500, 2000, "DeepSeek API 연결 실패"),
    API_AUTHENTICATION_FAILED(401, 2001, "API 인증 실패"),
    API_REQUEST_TIMEOUT(408, 2002, "API 요청 시간 초과"),
    API_INTERNAL_SERVER_ERROR(500, 2003, "API 내부 서버 오류"),
    INVALID_API_RESPONSE(500, 2004, "잘못된 API 응답");

    private final Integer httpStatusCode;
    private final Integer errorCode;
    private final String message;

    DementiaTestErrorCode(Integer httpStatusCode, Integer errorCode, String message) {
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
