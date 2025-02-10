package com.talktalkcare.domain.dementia.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.talktalkcare.domain.dementia.client.DeepSeekClient;
import com.talktalkcare.domain.dementia.client.DeepSeekRequestBuilder;
import com.talktalkcare.domain.dementia.client.DeepSeekResponseParser;
import com.talktalkcare.domain.dementia.converter.AiDementiaAnalysisConverter;
import com.talktalkcare.domain.dementia.dto.DementiaAiDto;
import com.talktalkcare.domain.dementia.entity.AiDementiaAnalysis;
import com.talktalkcare.domain.dementia.error.DementiaTestErrorCode;
import com.talktalkcare.domain.dementia.exception.DementiaTestException;
import com.talktalkcare.domain.dementia.repository.AiAnalysisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;

@Service
@RequiredArgsConstructor
public class AiAnalysisService {

    private final DeepSeekRequestBuilder requestBuilder;
    private final DeepSeekClient deepSeekClient;
    private final DeepSeekResponseParser responseParser;
    private final AiAnalysisRepository aiAnalysisRepository;

    @Value("${deepseek.api.base-url}")
    private String baseUrl;

    @Value("${deepseek.api.api-key}")
    private String apiKey;

    public String analyzeTestResults(Integer userId, String prompt, String testResult, int analysisType) {
        String requestBody = requestBuilder.buildRequest(prompt, testResult);
        String response = deepSeekClient.sendRequest(requestBody, baseUrl, apiKey);
        String summary = responseParser.parseResponse(response);

        saveAnalysisResult(userId, summary, analysisType);

        return summary;
    }

    private void saveAnalysisResult(Integer userId, String summary, int analysisType) {
        int analysisSeq = aiAnalysisRepository.findMaxAnalysisSequenceByUserId(userId, analysisType);

        AiDementiaAnalysis analysis = AiDementiaAnalysisConverter.toEntity(userId, summary, analysisType, analysisSeq+1);

        aiAnalysisRepository.save(analysis);
    }

}
