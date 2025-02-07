package com.talktalkcare.domain.games.controller;

import com.talktalkcare.common.response.Api;
import com.talktalkcare.domain.dementia.dto.DementiaTestDto;
import com.talktalkcare.domain.dementia.entity.DementiaTestResult;
import com.talktalkcare.domain.dementia.service.AiAnalysisService;
import com.talktalkcare.domain.dementia.service.DementiaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dementia-test")
@RequiredArgsConstructor
public class GameController {

    private final DementiaService dementiaService;
    private final AiAnalysisService aiAnalysisService;

    @PostMapping("/result")
    public Api<String> saveTestResult(@RequestBody DementiaTestDto dto) {
        dementiaService.saveTestResult(dto);
        return Api.OK("테스트 결과가 성공적으로 저장되었습니다.");
    }
    /**
     * 클라이언트 요청에 따른 testResult 조회 및 분석
     * @param requestType "0" 또는 "1"
     * @param userId 사용자 ID
     * @return 분석된 AI 결과
     */
    @GetMapping("/analysis")
    public Api<?> getTestResults(@RequestParam int requestType,
                                      @RequestParam int userId) {
        // DementiaService에서 요청에 따른 testResult 리스트를 가져옴
        List<DementiaTestResult> testResults = dementiaService.handleRequest(requestType, userId);

        //테스트 결과 비교군이 두개가 안 될 경우
        if (testResults.size() < 2) {
            return Api.ERROR("비교할 테스트 대상이 없습니다.",2004);
        }
        // 분석할 텍스트 생성
        String analysisInputText = buildAnalysisInput(requestType, testResults);

        // AI 분석 실행
        String analysisResponse = analyzeTestResults(userId,requestType, analysisInputText);
        System.out.println(analysisResponse);

        return Api.OK(analysisResponse);
    }
    private String buildAnalysisInput(int requestType, List<DementiaTestResult> testResults) {
        StringBuilder analysisInputText = new StringBuilder();

        if (requestType==1) { // 유저-유저 자가 테스트 분석
            analysisInputText.append("최근한 테스트 결과: ")
                    .append(testResults.get(0).getTestResult())
                    .append("\n\n")
                    .append("이전 테스트 결과: ")
                    .append(testResults.get(1).getTestResult())
                    .append("\n\n");
        }
        if (requestType==2)  { // 유저-보호자 테스트 분석
            for (DementiaTestResult testResult : testResults) {
                analysisInputText.append("Test ID: ").append(testResult.getTestId())
                        .append("\nTest Result: ").append(testResult.getTestResult())
                        .append("\n\n");
            }
        }

        return analysisInputText.toString();
    }
    private String analyzeTestResults(int userId, int requestType, String analysisInputText) {
        if (requestType==1) {
            return aiAnalysisService.analyzeTestResults(userId,analysisInputText);
        }
        if (requestType==2) {
            return aiAnalysisService.analyzeTwoTestResults(userId,analysisInputText);
        }
        return "";
    }
}