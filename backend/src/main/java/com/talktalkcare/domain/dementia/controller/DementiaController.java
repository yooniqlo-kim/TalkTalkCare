package com.talktalkcare.domain.dementia.controller;

import com.talktalkcare.common.response.Api;
import com.talktalkcare.domain.dementia.entity.DementiaTestResult;
import com.talktalkcare.domain.dementia.service.DementiaService;
import com.talktalkcare.domain.dementia.service.AiAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/dementia")
public class DementiaController {

    private final DementiaService dementiaService;
    private final AiAnalysisService aiAnalysisService;

    @Autowired
    public DementiaController(DementiaService dementiaService, AiAnalysisService aiAnalysisService) {
        this.dementiaService = dementiaService;
        this.aiAnalysisService = aiAnalysisService;
    }
    /**
     * 클라이언트 요청에 따른 testResult 조회 및 분석
     * @param requestType "1-2" 또는 "1-1"
     * @param userId 사용자 ID
     * @return 분석된 AI 결과
     */
    @GetMapping("/results")
    public Api<String> getTestResults(@RequestParam String requestType,
                                      @RequestParam int userId) {
        // DementiaService에서 요청에 따른 testResult 리스트를 가져옴
        List<DementiaTestResult> testResults = dementiaService.handleRequest(requestType, userId);

        StringBuilder analysisInputText = new StringBuilder();
        String analysisResponse = ""; // analysisResponse 변수를 메서드의 범위에서 선언

        System.out.println(testResults);

        if ("1-1".equals(requestType)) {
            // 최신 테스트 결과와 이전 테스트 결과를 비교하는 경우
            if (testResults.size() >= 2) {
                // 최신 결과와 이전 결과를 확인 후 코드 실행
                DementiaTestResult latestTestResult = testResults.get(0);  // 최신 결과
                DementiaTestResult previousTestResult = testResults.get(1); // 이전 결과

                // AI 분석에 전달할 텍스트 구성 (최신과 이전 결과를 비교 분석할 수 있도록)
                analysisInputText.append("Latest Test Result : ")
                        .append(latestTestResult.getTestResult())
                        .append("\n\n");

                analysisInputText.append("Previous Test Result : ")
                        .append(previousTestResult.getTestResult())
                        .append("\n\n");
            }

            System.out.println("TestResults:\n" + analysisInputText);
            analysisResponse = aiAnalysisService.analyzeTestResults(analysisInputText.toString());

        } else if ("1-2".equals(requestType)) {
            // "1-2"일 경우 두 개의 결과를 하나의 입력 텍스트로 합침
            for (DementiaTestResult testResult : testResults) {
                analysisInputText.append("Test ID: ").append(testResult.getTestId())
                        .append("\n").append("Test Result: ").append(testResult.getTestResult())
                        .append("\n\n");
            }

            System.out.println("TestResults:\n" + analysisInputText);
            analysisResponse = aiAnalysisService.analyzeTwoTestResults(analysisInputText.toString());
        }

        System.out.println(analysisResponse);
        return Api.OK(analysisResponse);
    }

}