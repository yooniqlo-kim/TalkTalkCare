package com.talktalkcare.domain.talktalkAI.controller;

import com.talktalkcare.common.response.Api;
import com.talktalkcare.domain.dementia.entity.DementiaTestResult;
import com.talktalkcare.domain.talktalkAI.dto.TalkTalkDto;
import com.talktalkcare.domain.talktalkAI.entity.TalkTalk;
import com.talktalkcare.domain.talktalkAI.service.TalkTalkService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/talktalk")
public class TalkTalkController {

    private final TalkTalkService talkTalkService;

    @GetMapping("/chat")
    public Api<String> getTestResults(@RequestParam String requestType,
                                      @RequestParam int userId) {

        String response = ""; // 분석 결과 변수
        StringBuilder talktalkResponse = new StringBuilder();

        talktalkResponse.append("응답: " + requestType + "\n");

            response = talkTalkService.talktalkAi(talktalkResponse.toString());

        return Api.OK(response);
    }
    @PostMapping("/save")
    public TalkTalk saveTalkTalk(@RequestBody TalkTalkDto talkTalkDto) {
        return talkTalkService.saveTalkTalk(talkTalkDto);
    }

    @GetMapping("/summary/{userId}")
    public String getSummary(@PathVariable int userId) {
        return talkTalkService.getSummary(userId);
    }
}
