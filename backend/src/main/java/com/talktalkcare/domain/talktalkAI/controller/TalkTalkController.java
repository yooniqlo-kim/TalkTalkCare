package com.talktalkcare.domain.talktalkAI.controller;

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

    @PostMapping("/save")
    public TalkTalk saveTalkTalk(@RequestBody TalkTalkDto talkTalkDto) {
        return talkTalkService.saveTalkTalk(talkTalkDto);
    }

    @GetMapping("/summary/{userId}")
    public String getSummary(@PathVariable int userId) {
        return talkTalkService.getSummaryByUserId(userId);
    }
}
