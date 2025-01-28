package com.talktalkcare.domain.dementia.service;

import com.talktalkcare.domain.dementia.error.DementiaTestErrorCode;
import com.talktalkcare.domain.dementia.exception.DementiaTestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;

import java.util.HashMap;
import java.util.Map;

@Service
public class DementiaAiService {

    private final RestTemplate restTemplate;

    @Value("https://api.deepseek.com/chat/completions")
    private String baseUrl;

    @Value("${deepseek.api.api-key}")
    private String apiKey;

    public DementiaAiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String analyzeText(String inputText) {
        String url = baseUrl;

        // JSON Body 생성
        String requestBody = "{\n" +
                "    \"model\": \"deepseek-chat\",\n" +
                "    \"messages\": [\n" +
                "        {\"role\": \"system\", \"content\": \"You are a helpful assistant.\"},\n" +
                "        {\"role\": \"user\", \"content\": \"" + inputText + "\"}\n" +
                "    ],\n" +
                "    \"stream\": false\n" +
                "}";

        // HttpHeaders 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey); // API Key를 Authorization 헤더에 추가

        // HttpEntity 설정
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        try {
            // RestTemplate을 사용하여 POST 요청 보내기
            String response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class).getBody();
            System.out.println("API 호출 성공, 응답: " + response);
            return response;
        } catch (Exception e) {
            // 예외 처리
            e.printStackTrace();
            throw new DementiaTestException(DementiaTestErrorCode.INVALID_API_RESPONSE);
        }
    }
}
