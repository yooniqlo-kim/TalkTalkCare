package com.talktalkcare.domain.dementia.controller;

import com.talktalkcare.common.response.Api;
import com.talktalkcare.domain.dementia.dto.DementiaTestDto;
import com.talktalkcare.domain.dementia.entity.DementiaTestResult;
import com.talktalkcare.domain.dementia.service.DementiaService;
import com.talktalkcare.domain.dementia.service.AiAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dementia")
@RequiredArgsConstructor
public class DementiaController {

    private final DementiaService dementiaService;
    private final AiAnalysisService aiAnalysisService;

    /**
     * 테스트 결과 저장 API
     * @param dto 테스트 결과 데이터 (JSON 요청 본문)
     * @return 성공 메시지
     */
    @PostMapping("/save")
    public Api<String> saveTestResult(@RequestBody DementiaTestDto dto) {
        dementiaService.saveTestResult(dto);
        return Api.OK("테스트 결과가 성공적으로 저장되었습니다.");
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
        String analysisResponse = ""; // 분석 결과 변수

        if ("1-1".equals(requestType) && testResults.size() >= 2) {
            // 최신 결과와 이전 결과 비교
            DementiaTestResult latestTestResult = testResults.get(0);
            DementiaTestResult previousTestResult = testResults.get(1);

            analysisInputText.append("Latest Test Result : ")
                    .append(latestTestResult.getTestResult())
                    .append("\n\n")
                    .append("Previous Test Result : ")
                    .append(previousTestResult.getTestResult())
                    .append("\n\n");

            analysisResponse = aiAnalysisService.analyzeTestResults(analysisInputText.toString());

        } else if ("1-2".equals(requestType)) {
            // 두 개의 테스트 결과를 분석
            for (DementiaTestResult testResult : testResults) {
                analysisInputText.append("Test ID: ").append(testResult.getTestId())
                        .append("\n").append("Test Result: ").append(testResult.getTestResult())
                        .append("\n\n");
            }
            analysisResponse = aiAnalysisService.analyzeTwoTestResults(analysisInputText.toString());
        }
        return Api.OK(analysisResponse);
    }
}