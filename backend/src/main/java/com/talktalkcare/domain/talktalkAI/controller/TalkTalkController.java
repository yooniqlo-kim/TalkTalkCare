package com.talktalkcare.domain.talktalkAI.controller;

import com.talktalkcare.common.response.Api;
import com.talktalkcare.domain.talktalkAI.dto.TalkTalkDto;
import com.talktalkcare.domain.talktalkAI.dto.UserInfoDto;
import com.talktalkcare.domain.talktalkAI.entity.TalkTalk;
import com.talktalkcare.domain.talktalkAI.service.TalkTalkService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequiredArgsConstructor
@RequestMapping("/talktalk")
public class TalkTalkController {

    private final TalkTalkService talkTalkService;
    // 🔹 유저별 Summary + 대화 기록을 저장하는 Map
    private final Map<Integer, StringBuilder> userConversations = new ConcurrentHashMap<>();

    /**
     * ✅ "대화 시작" 요청 시 해당 유저의 summary 불러오기
     */
    @PostMapping("/start")
    public Api startChat(@RequestParam String loginId) {
        // 해당 유저의 summary 가져와서 conversation 초기화
        int userId = talkTalkService.getUserInfo(loginId);
//        String name = userInfo.getName();
        String summary = talkTalkService.getSummary(userId);

        userConversations.put(userId, new StringBuilder("이전 대화 요약: " + summary + "\n"));

        System.out.println("✅" + userId + ":" + summary);
        return Api.OK();
    }

    /**
     * ✅ 대화할 때 이전 대화 내용 + 새로운 response를 누적하여 유지
     */
    @GetMapping("/chat")
    public Api<String> getChatResponse(@RequestParam String response,
                                       @RequestParam int userId) {

        // 🔹 기존 summary + 이전 대화 + 현재 response 누적
        StringBuilder conversation = userConversations.get(userId);
        conversation.append("유저: ").append(response).append("\n");

        // AI 응답 생성
        String aiResponse = talkTalkService.talktalkAi(conversation.toString());

        // 🔹 AI 응답도 conversation에 누적
        conversation.append("AI: ").append(aiResponse).append("\n");

        System.out.println( conversation  + aiResponse);
        return Api.OK(aiResponse);
    }

    @PostMapping("/save")
    public Api<String> saveTalkTalk(@RequestBody TalkTalkDto talkTalkDto,
                                    @RequestParam int userId) {

        String conversation = userConversations.get(userId).toString();
        String summary = talkTalkService.summarizeConversation(conversation);
        System.out.println(conversation + ":" + summary);

        talkTalkService.saveTalkTalk(new TalkTalkDto(userId, summary));

        return Api.OK("대화 내용이 저장되었습니다.");
    }
}
