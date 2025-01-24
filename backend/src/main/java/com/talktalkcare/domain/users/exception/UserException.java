package com.talktalkcare.domain.users.exception;

import com.talktalkcare.common.error.ErrorCodeInterface;
import com.talktalkcare.common.exception.ExceptionInterface;
import lombok.NoArgsConstructor;

@NoArgsConstructor
public class UserException extends RuntimeException implements ExceptionInterface {

    public UserException(String message) {
        super(message);
    }

    @Override
    public ErrorCodeInterface getErrorCodeIfs() {
        return null;
    }

}
