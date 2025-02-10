package com.talktalkcare.domain.dementia.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.talktalkcare.domain.dementia.error.DementiaTestErrorCode;
import com.talktalkcare.domain.dementia.exception.DementiaTestException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class DeepSeekResponseParser {
    private final ObjectMapper objectMapper;

    public String parseResponse(String response) {
        if (response == null || response.isEmpty()) {
            throw new DementiaTestException(DementiaTestErrorCode.INVALID_API_RESPONSE);
        }

        try {
            JsonNode responseJson = objectMapper.readTree(response);
            return responseJson.get("choices").get(0).get("message").get("content").asText();
        } catch (Exception e) {
            throw new DementiaTestException(DementiaTestErrorCode.INVALID_API_RESPONSE);
        }

    }
}