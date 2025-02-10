package com.talktalkcare.domain.dementia.dto;

import com.talktalkcare.domain.dementia.error.DementiaTestErrorCode;
import com.talktalkcare.domain.dementia.exception.DementiaTestException;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Getter
@AllArgsConstructor
public enum RequestType {
    LATEST_TWO_SAME_TEST(1, "동일한 테스트 ID의 최신 2개 결과"),
    LATEST_ONE_DIFFERENT_TEST(2, "서로 다른 테스트 ID 각각 최신 1개 결과");

    private static final Map<Integer, RequestType> LOOKUP_MAP =
            Stream.of(values()).collect(Collectors.toMap(RequestType::getValue, e -> e));

    private final int value;
    private final String description;

    public static RequestType fromValue(int value) {
        RequestType requestType = LOOKUP_MAP.get(value);

        if (requestType == null) throw new DementiaTestException(DementiaTestErrorCode.INVALID_REQUEST_TYPE);

        return requestType;
    }

}