package com.talktalkcare.domain.dementia.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.talktalkcare.domain.dementia.error.DementiaTestErrorCode;
import com.talktalkcare.domain.dementia.exception.DementiaTestException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class DeepSeekRequestBuilder {

    private final ObjectMapper objectMapper;

    public String buildRequest(String prompt, String userInput) {
        try {
            ObjectNode rootNode = objectMapper.createObjectNode();
            rootNode.put("model", "deepseek-chat");
            rootNode.put("stream", false);

            ArrayNode messages = rootNode.putArray("messages");

            ObjectNode systemNode = objectMapper.createObjectNode();
            systemNode.put("role", "system");
            systemNode.put("content", prompt);
            messages.add(systemNode);

            ObjectNode userNode = objectMapper.createObjectNode();
            userNode.put("role", "user");
            userNode.put("content", userInput);
            messages.add(userNode);

            return objectMapper.writeValueAsString(rootNode);
        } catch (Exception e) {
            throw new DementiaTestException(DementiaTestErrorCode.API_REQUEST_BUILD_FAILED);
        }
    }
}