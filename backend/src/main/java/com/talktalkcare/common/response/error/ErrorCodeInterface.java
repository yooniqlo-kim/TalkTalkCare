package com.talktalkcare.common.response.error;

public interface ErrorCodeInterface {

    Integer getHttpStatusCode();

    Integer getErrorCode();

    String getMessage();

}