package com.talktalkcare.domain.dementia.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class DementiaAiService {

    private final RestTemplate restTemplate; // 초기화 필요
    @Value("${deepseek.api.base-url}")
    private String baseUrl;
    @Value("${deepseek.api.api-key}")
    private String apiKey;

    // 생성자를 통해 RestTemplate 주입
    public DementiaAiService(RestTemplate restTemplate) {

        this.restTemplate = restTemplate;
    }

    @PostConstruct
    public void init() {
        System.out.println("Base URL: " + baseUrl);
        System.out.println("API Key: " + apiKey);
    }

    public String analyzeText(String inputText) {
        String url = baseUrl + "/analyze"; // API 엔드포인트
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("text", inputText);

        try {
            System.out.println("API 호출 시작: " + url + " - 입력 텍스트: " + inputText);
            String response = restTemplate.postForObject(url, requestBody, String.class);
            System.out.println("API 호출 성공, 응답: " + response);
            return response;
        } catch (HttpClientErrorException e) {
            System.out.println("클라이언트 오류 발생: HTTP 상태 코드 - " + e.getStatusCode() + ", 응답 본문: " + e.getResponseBodyAsString());
            e.printStackTrace();
        } catch (HttpServerErrorException e) {
            System.out.println("서버 오류 발생: HTTP 상태 코드 - " + e.getStatusCode() + ", 응답 본문: " + e.getResponseBodyAsString());
            e.printStackTrace();
        } catch (Exception e) {
            System.out.println("알 수 없는 오류 발생");
            e.printStackTrace();
        }
        return null;
    }
}