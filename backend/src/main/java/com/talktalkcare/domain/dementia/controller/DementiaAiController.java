package com.talktalkcare.domain.dementia.controller;
import com.talktalkcare.common.response.Api;
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
    @GetMapping
    public Api<String> analyzeText(@RequestParam String inputText)  {
        dementiaAiService.analyzeText(inputText);

        String result = dementiaAiService.analyzeText(inputText);

        return Api.OK(result);
    }
}
