package com.talktalkcare.domain.games.exception;

import com.talktalkcare.common.error.ErrorCodeInterface;
import com.talktalkcare.common.exception.ApplicationException;

public class DementiaTestException extends ApplicationException {

    public DementiaTestException(ErrorCodeInterface errorCode) {
        super(errorCode);
    }

}
