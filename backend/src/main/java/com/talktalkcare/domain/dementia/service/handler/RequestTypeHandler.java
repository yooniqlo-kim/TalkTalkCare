package com.talktalkcare.domain.dementia.service.handler;

import com.talktalkcare.domain.dementia.dto.RequestType;
import com.talktalkcare.domain.dementia.entity.DementiaTestResult;

import java.util.List;

public interface RequestTypeHandler {
    RequestType getRequestType();

    List<DementiaTestResult> handleRequest(Integer userId);

    String analyzeTestResults(Integer userId, List<DementiaTestResult> testResults);

    String generatePrompt();

    String buildAnalysisInput(List<DementiaTestResult> testResults);
}
