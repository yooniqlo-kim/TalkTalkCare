package com.talktalkcare.domain.talktalkAI.service;

import com.talktalkcare.domain.ai.dto.AiAnalysisRequest;
import com.talktalkcare.domain.ai.service.AiAnalysisService;
import com.talktalkcare.domain.talktalkAI.converter.TalkTalkConverter;
import com.talktalkcare.domain.talktalkAI.entity.TalkTalk;
import com.talktalkcare.domain.talktalkAI.model.ConversationHistory;
import com.talktalkcare.domain.talktalkAI.repository.TalkTalkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class TalkTalkService {

    private final TalkTalkRepository talkTalkRepository;
    private final AiAnalysisService aiAnalysisService;
    private final Map<Integer, ConversationHistory> userConversations = new ConcurrentHashMap<>();

    public String initializeConversation(Integer userId) {
        String summary = talkTalkRepository.findTalkSummary(userId);

        if(summary == null) {
            summary = "";
        }

        storeConversationHistory(userId, summary);

        return summary;
    }

    private void storeConversationHistory(Integer userId, String summary) {
        userConversations.put(userId, new ConversationHistory(summary));
    }

    public String getAiResponse(Integer userId, String userResponse) {
        ConversationHistory history = userConversations.get(userId);
        history.appendUserMessage(userResponse);

        AiAnalysisRequest request = createAiRequest(history.getFullHistory());
        String aiResponse = aiAnalysisService.analyze(request);

        history.appendAiMessage(aiResponse);

        return aiResponse;
    }

    private AiAnalysisRequest createAiRequest(String conversationHistory) {
        return AiAnalysisRequest.builder()
                .prompt(generatePrompt())
                .inputData(generateInput(conversationHistory))
                .build();
    }

    private String generatePrompt() {
        return "다음은 유저의 성향 및 특징이야. 이를 기반으로 대화를 이어나갈 수 있게 두 문장 이내로 보내줘";
    }

    private String generateInput(String chat) {
        return chat.replaceAll("[\\u0000-\\u001F]", "");
    }

    public void saveConversation(Integer userId) {
        String conversationHistory = userConversations.get(userId).getFullHistory();

        AiAnalysisRequest request = AiAnalysisRequest.builder()
                .prompt("\"다음은 유저와의 대화 내용이야. 유저 정보를 저장하기 위해 다음 내용을 최대한 간단하게 요약해줘.\" +\n" +
                        "                            \"중복된 내용은 최신 대화 기반으로 업데이트해줘 \" +\n" +
                        "                            \"예를 들어 유저 나이:72세,짬뽕 좋아함,음악좋아함\"\n")
                .inputData(conversationHistory)
                .build();

        String aiResponse = aiAnalysisService.analyze(request);

        TalkTalk entity = TalkTalkConverter.toEntity(userId, aiResponse);

        talkTalkRepository.save(entity);

        userConversations.remove(userId);
    }

}
