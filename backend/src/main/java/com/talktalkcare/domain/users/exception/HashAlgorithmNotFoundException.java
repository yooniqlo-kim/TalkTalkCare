package com.talktalkcare.domain.users.exception;

import com.talktalkcare.common.error.ErrorCodeInterface;
import com.talktalkcare.common.exception.ExceptionInterface;
import com.talktalkcare.domain.users.error.UserErrorCode;

public class HashAlgorithmNotFoundException extends UserException implements ExceptionInterface {

    private final ErrorCodeInterface errorCodeIfs;

    public HashAlgorithmNotFoundException(String message) {
        super(message);
        this.errorCodeIfs = UserErrorCode.HASH_ALGORITHM_NOT_FOUND;
    }

    @Override
    public ErrorCodeInterface getErrorCodeIfs() {
        return errorCodeIfs;
    }

}
