package com.talktalkcare.domain.users.exception;

import com.talktalkcare.common.error.ErrorCodeInterface;
import com.talktalkcare.common.response.Api;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Order(1)
public class UserExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(UserExceptionHandler.class);

    @ExceptionHandler(value = UserException.class)
    public ResponseEntity<Api<Void>> exceptionHandler(UserException userException) {
        ErrorCodeInterface errorCodeIfs = userException.getErrorCodeIfs();

        log.error("{} : {}", errorCodeIfs.getErrorCode(), errorCodeIfs.getMessage(), userException);

        return ResponseEntity
                .status(errorCodeIfs.getHttpStatusCode())
                .body(Api.ERROR(errorCodeIfs.getMessage()));
    }

}