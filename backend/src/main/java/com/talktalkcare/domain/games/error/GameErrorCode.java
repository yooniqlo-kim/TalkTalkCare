package com.talktalkcare.domain.games.error;

import com.talktalkcare.common.error.ErrorCodeInterface;

public enum GameErrorCode implements ErrorCodeInterface {

    GAME_CONNECTION_FAILED(500, 3000, "게임 서버 연결 실패"),
    GAME_AUTHENTICATION_FAILED(401, 3001, "게임 결과 전송 실패"),
    GAME_REQUEST_TIMEOUT(408, 3002, "게임 요청 시간 초과");

    private final Integer httpStatusCode;
    private final Integer errorCode;
    private final String message;

    // Constructor to initialize the error codes
    GameErrorCode(Integer httpStatusCode, Integer errorCode, String message) {
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
