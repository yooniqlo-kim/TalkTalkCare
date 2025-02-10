package com.talktalkcare.domain.games.controller;

import com.talktalkcare.common.response.Api;
import com.talktalkcare.domain.games.dto.GameRecordDto;
import com.talktalkcare.domain.games.service.DailyGameService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/game")
@RequiredArgsConstructor
public class GameController {

    private final DailyGameService dailyGameService;

    @PostMapping("/send-game-result")
    public Api<String> saveTestResult(@RequestBody GameRecordDto dto) {
        dailyGameService.saveGameResult(dto);
        return Api.OK("게임 결과 전송 완료");
    }
    /**
     * 클라이언트 요청에 따른 testResult 조회 및 분석
     * @param requestType "0" 또는 "1"
     * @param userId 사용자 ID
     * @return 분석된 AI 결과
     */
  /*  @GetMapping("/analysis")
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
    }*/

}
