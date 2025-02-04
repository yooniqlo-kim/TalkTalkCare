package com.talktalkcare.domain.talktalkAI.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.talktalkcare.domain.talktalkAI.dto.TalkTalkDto;
import com.talktalkcare.domain.talktalkAI.entity.TalkTalk;
import com.talktalkcare.domain.talktalkAI.repository.TalkTalkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class TalkTalkService {

    private final TalkTalkRepository talkTalkRepository;

    private final RestTemplate restTemplate;

    @Value("https://api.deepseek.com/chat/completions")
    private String baseUrl;

    @Value("${deepseek.api.api-key}")
    private String apiKey;

    public int getUserInfo(String loginId) {
        return talkTalkRepository.findUserId(loginId);
    }
    public TalkTalk saveTalkTalk(TalkTalkDto talkTalkDto) {
        TalkTalk talkTalk = new TalkTalk();
        talkTalk.setUserId(talkTalkDto.getUserId());
        talkTalk.setSummary(talkTalkDto.getSummary());  // Assuming "Summary" is the text field
        return talkTalkRepository.save(talkTalk);
    }
    public String getSummary(int userId) {
        TalkTalk summary = talkTalkRepository.findTalkSummary(userId);
        System.out.println("summary:"+summary);
        if (summary != null) {
            return summary.getSummary(); // Return the summary if found
        } else {
            return " "; // Return a default message if not found
        }
    }

    public String talktalkAi(String summary) {
        ObjectMapper objectMapper = new ObjectMapper();

        try {
            // JSON 객체 생성
            ObjectNode rootNode = objectMapper.createObjectNode();
            rootNode.put("model", "deepseek-chat");
            rootNode.put("stream", false);

            // messages 배열 생성
            ArrayNode messages = rootNode.putArray("messages");

            // "system" 메시지 추가
            ObjectNode systemMessage = objectMapper.createObjectNode();
            systemMessage.put("role", "system");
            systemMessage.put("content",
                    "다음은 유저의 성향 및 특징이야. 이를 기반으로 대화를 이어나갈거야." +
                            " 두 문장 이내로 보내줘 "
                            );
            messages.add(systemMessage);
            // "user" 메시지 추가
            ObjectNode userMessage = objectMapper.createObjectNode();
            userMessage.put("role", "user");
            userMessage.put("content", sanitizeInput(summary));
            messages.add(userMessage);

            // JSON 문자열로 변환
            String requestBody = objectMapper.writeValueAsString(rootNode);

            // HTTP 요청 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            // HTTP 요청 객체 생성
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            // API 호출
            String response = restTemplate.exchange(baseUrl, HttpMethod.POST, entity, String.class).getBody();

            // JSON 파싱
            JsonNode responseJson = objectMapper.readTree(response);
            String content = responseJson
                    .get("choices") // "choices" 배열
                    .get(0)         // 첫 번째 선택지
                    .get("message") // "message" 객체
                    .get("content") // "content" 필드
                    .asText();      // 문자열로 변환

            // content 출력
            System.out.println(content);

            return content;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("API 호출 실패: " + e.getMessage());
        }
    }
    private String sanitizeInput(String input) {
        return input.replaceAll("[\\u0000-\\u001F]", ""); // 제어 문자 제거
    }

    public String summarizeConversation(String conversation) {
        ObjectMapper objectMapper = new ObjectMapper();

        try {
            // JSON 객체 생성
            ObjectNode rootNode = objectMapper.createObjectNode();
            rootNode.put("model", "deepseek-chat");
            rootNode.put("stream", false);

            // messages 배열 생성
            ArrayNode messages = rootNode.putArray("messages");

            // "system" 메시지 추가
            ObjectNode systemMessage = objectMapper.createObjectNode();
            systemMessage.put("role", "system");
            systemMessage.put("content",
                    "다음은 유저와의 대화 내용이야. 유저의 정보를 저장하기 위해 다음 내용을 요약해줘" +
                            "예를 들어 유저 나이: 72세, 짬뽕 좋아함,혼자 살고있음, (이런식으로) "
            );
            messages.add(systemMessage);
            // "user" 메시지 추가
            ObjectNode userMessage = objectMapper.createObjectNode();
            userMessage.put("role", "user");
            userMessage.put("content", sanitizeInput(conversation));
            messages.add(userMessage);

            // JSON 문자열로 변환
            String requestBody = objectMapper.writeValueAsString(rootNode);

            // HTTP 요청 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            // HTTP 요청 객체 생성
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            // API 호출
            String response = restTemplate.exchange(baseUrl, HttpMethod.POST, entity, String.class).getBody();

            // JSON 파싱
            JsonNode responseJson = objectMapper.readTree(response);
            String content = responseJson
                    .get("choices") // "choices" 배열
                    .get(0)         // 첫 번째 선택지
                    .get("message") // "message" 객체
                    .get("content") // "content" 필드
                    .asText();      // 문자열로 변환

            // content 출력
            System.out.println(content);

            return content;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("API 호출 실패: " + e.getMessage());
        }
    }
}
