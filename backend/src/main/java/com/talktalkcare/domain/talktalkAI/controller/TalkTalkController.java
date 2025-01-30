package com.talktalkcare.domain.talktalkAI.controller;

import com.talktalkcare.domain.talktalkAI.service.TalkTalkService;
import com.talktalkcare.domain.talktalkAI.service.TalkTalkService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/talktalk")
public class TalkTalkController {

    private final TalkTalkService talktalkService;

}
