package com.talktalkcare.domain.talktalkAI.controller;

import com.talktalkcare.common.response.Api;
import com.talktalkcare.domain.dementia.entity.DementiaTestResult;
import com.talktalkcare.domain.talktalkAI.dto.TalkTalkDto;
import com.talktalkcare.domain.talktalkAI.entity.TalkTalk;
import com.talktalkcare.domain.talktalkAI.service.TalkTalkService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/talktalk")
public class TalkTalkController {

    private final TalkTalkService talkTalkService;

    @GetMapping("/chat")
    public Api<String> getTestResults(@RequestParam String requestType,
                                      @RequestParam int userId) {
        // DementiaService에서 요청에 따른 testResult 리스트를 가져옴
        List<DementiaTestResult> testResults = talkTalkService.handleRequest(requestType, userId);

        StringBuilder analysisInputText = new StringBuilder();
        String response = ""; // 분석 결과 변수

            // 최신 결과와 이전 결과 비교
            DementiaTestResult latestTestResult = testResults.get(0);
            DementiaTestResult previousTestResult = testResults.get(1);

            analysisInputText.append("Latest Test Result : ")
                    .append(latestTestResult.getTestResult())
                    .append("\n\n")
                    .append("Previous Test Result : ")
                    .append(previousTestResult.getTestResult())
                    .append("\n\n");

            response = talkTalkService.talktalkAi(analysisInputText.toString());

        return Api.OK(response);
    }
    @PostMapping("/save")
    public TalkTalk saveTalkTalk(@RequestBody TalkTalkDto talkTalkDto) {
        return talkTalkService.saveTalkTalk(talkTalkDto);
    }

    @GetMapping("/summary/{userId}")
    public String getSummary(@PathVariable int userId) {
        return talkTalkService.getSummaryByUserId(userId);
    }
}
