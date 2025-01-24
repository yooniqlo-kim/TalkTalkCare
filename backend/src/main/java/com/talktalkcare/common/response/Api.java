package com.talktalkcare.common.response;

public class Api<T> {
    private static final Api<Object> SUCCESS = new Api<>(Result.OK());

    private Result result;
    private T body;

    public Api() {
    }

    public Api(Result result) {
        this.result = result;
    }

    public static Api<Object> OK() {
        return SUCCESS;
    }

    public static <T> Api<T> OK(T body) {
        Api<T> api = new Api<>();
        api.result = Result.OK();
        api.body = body;
        return api;
    }

    public static Api<Object> ERROR(String msg) {
        Api<Object> api = new Api<>();
        api.result = Result.ERROR(msg);
        return api;
    }

    public Result getResult() {
        return result;
    }

    public T getBody() {
        return body;
    }

}