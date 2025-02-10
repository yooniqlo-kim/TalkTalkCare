package com.talktalkcare.domain.dementia.service;

import com.talktalkcare.domain.dementia.converter.TestResultConverter;
import com.talktalkcare.domain.dementia.dto.DementiaTestDto;
import com.talktalkcare.domain.dementia.dto.RequestType;
import com.talktalkcare.domain.dementia.entity.DementiaTestResult;
import com.talktalkcare.domain.dementia.error.DementiaTestErrorCode;
import com.talktalkcare.domain.dementia.exception.DementiaTestException;
import com.talktalkcare.domain.dementia.repository.DementiaRepository;
import com.talktalkcare.domain.dementia.service.handler.RequestTypeHandler;
import com.talktalkcare.domain.dementia.service.handler.RequestTypeHandlerFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DementiaService {

    private final DementiaRepository dementiaRepository;
    private final RequestTypeHandlerFactory requestTypeHandlerFactory;

    @Transactional
    public void saveTestResult(DementiaTestDto dementiaTestDto) {
        DementiaTestResult testResult = TestResultConverter.dtoToEntity(dementiaTestDto);

        dementiaRepository.save(testResult);
    }

    public String generateAiTestAnalysis(Integer userId, int requestType) {
        RequestType type = RequestType.fromValue(requestType);
        RequestTypeHandler handler = requestTypeHandlerFactory.getHandler(type);

        List<DementiaTestResult> testResults = handler.handleRequest(userId);

        if(testResults.size() < 2)
            throw new DementiaTestException(DementiaTestErrorCode.NOT_ENOUGH_TEST_RESULTS);

        return handler.analyzeTestResults(userId, testResults);
    }

}
