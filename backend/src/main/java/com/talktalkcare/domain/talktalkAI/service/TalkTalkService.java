package com.talktalkcare.domain.talktalkAI.service;

import com.talktalkcare.domain.talktalkAI.dto.TalkTalkDto;
import com.talktalkcare.domain.talktalkAI.entity.TalkTalk;
import com.talktalkcare.domain.talktalkAI.repository.TalkTalkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TalkTalkService {

    private final TalkTalkRepository talkTalkRepository;

    public TalkTalk saveTalkTalk(TalkTalkDto talkTalkDto) {
        TalkTalk talkTalk = new TalkTalk();
        talkTalk.setUserId(talkTalkDto.getUserId());
        talkTalk.setSummary(talkTalkDto.getSummary());  // Assuming "Summary" is the text field
        return talkTalkRepository.save(talkTalk);
    }
    public String getSummaryByUserId(int userId) {
        TalkTalk talkTalk = talkTalkRepository.findByUserId(userId);
        if (talkTalk != null) {
            return talkTalk.getSummary(); // Return the summary if found
        } else {
            return "No summary found for user."; // Return a default message if not found
        }
    }
}
