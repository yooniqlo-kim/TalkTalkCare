package com.talktalkcare.domain.dementia.controller;

import com.talktalkcare.domain.dementia.service.DementiaAiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/analyze")
public class DementiaAiController {

    private final DementiaAiService dementiaAiService;

    @Autowired
    public DementiaAiController(DementiaAiService dementiaAiService) {
        this.dementiaAiService = dementiaAiService;
    }

    @PostMapping
    public String analyzeText(@RequestBody String inputText) {
        // 로그 추가: 텍스트 입력이 도달했는지 확인
        System.out.println("입력된 텍스트: " + inputText);

        String result = dementiaAiService.analyzeText(inputText);

        // 결과 로그
        System.out.println("AI 분석 결과: " + result);

        return result;
    }
}
