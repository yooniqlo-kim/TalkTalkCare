package com.talktalkcare.domain.games.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.talktalkcare.domain.dementia.dto.DementiaAiDto;
import com.talktalkcare.domain.dementia.entity.AiDementiaAnalysis;
import com.talktalkcare.domain.dementia.error.DementiaTestErrorCode;
import com.talktalkcare.domain.dementia.exception.DementiaTestException;
import com.talktalkcare.domain.dementia.repository.AiAnalysisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;

@Service
public class AiAnalysisService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private AiAnalysisRepository aiAnalysisRepository; // 리포지토리 주입

    @Value("https://api.deepseek.com/chat/completions")
    private String baseUrl;

    @Value("${deepseek.api.api-key}")
    private String apiKey;

    public AiAnalysisService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    //유저-유저 테스트 분석
    public String analyzeTestResults(int userId, String inputText) {
        return analyzeTestResults(inputText, userId, 1); // analysisType 1은 유저-유저 분석
    }
    //유저-보호자 테스트 분석ㅂㅁ
    public String analyzeTwoTestResults(int userId, String inputText) {

        return analyzeTestResults(inputText, userId, 2); // analysisType 2은 유저-보호자 분석
    }

    // 분석 공통 처리 메소드
    private String analyzeTestResults(String inputText, int userId, int analysisType) {
        // 1. DeepSeek API를 통해 summary 생성
        String summary = callDeepSeekApi(generateSystemMessage(analysisType), inputText);
        System.out.println(summary);

        // 2. 1단계에서 생성된 summary와 함께 analysisSeq 계산
        // 2. 1단계에서 생성된 summary와 함께 analysisSeq 계산
        int analysisSeq = aiAnalysisRepository.findMaxAnalysisSequenceByUserId(userId); // aiAnalysisRepository 인스턴스를 통해 호출

        DementiaAiDto dto = new DementiaAiDto();
        dto.setUserId(userId);
        dto.setSummary(summary); // AI에서 생성된 summary
        dto.setAnalysisType(analysisType); // 분석 타입 (유저-유저 또는 유저-보호자)
        dto.setAnalysisSeq(analysisSeq); // 분석 순서

        saveToDatabase(dto);

        // 5. 생성된 summary를 반환하거나, 다른 필요한 작업 수행
        return summary;
    }
    private void saveToDatabase(DementiaAiDto dto) {

        AiDementiaAnalysis analysis = new AiDementiaAnalysis();
        analysis.setUserId(dto.getUserId());
        analysis.setAnalysisResult(dto.getSummary());
        analysis.setAnalysisType(dto.getAnalysisType());
        analysis.setAnalysisSequence(dto.getAnalysisSeq());
        System.out.println(analysis);
        aiAnalysisRepository.save(analysis); // DB에 저장
    }


    private String generateSystemMessage(int isTwoTestComparison) {
        StringBuilder message = new StringBuilder();

        message.append("유저의 치매 진단 테스트 결과를 분석할 거야. ")
                .append(isTwoTestComparison ==1?
                        "유저 자가 진단 테스트와 보호자가 평가한 테스트를 비교하여 변화와 개선점, 주의할 부분을 요약해줘." :
                        "최근과 과거의 자가 치매 진단 테스트 결과를 비교하여 변화와 개선점, 주의할 부분을 요약해줘.")
                .append("모든 문항과 문항 번호를 나열하지 말고, 결론만 간결하게 3문장 이내로 알려줘 .");

        if (isTwoTestComparison ==1)  {
            message.append("\n테스트 문항:\n").append(getUserTestQuestions());
        }
        if (isTwoTestComparison ==2) {
            message.append("\n유저 테스트 문항:\n").append(getUserTestQuestions())
                    .append("\n보호자 테스트 문항:\n").append(getCaregiverTestQuestions());
        }

        return message.toString();
    }
    // DeepSeek API 호출
    private String callDeepSeekApi(String systemMessage, String userInput) {
        try {
            ObjectNode rootNode = objectMapper.createObjectNode();
            rootNode.put("model", "deepseek-chat");
            rootNode.put("stream", false);

            ArrayNode messages = rootNode.putArray("messages");

            ObjectNode systemNode = objectMapper.createObjectNode();
            systemNode.put("role", "system");
            systemNode.put("content", systemMessage);
            messages.add(systemNode);

            ObjectNode userNode = objectMapper.createObjectNode();
            userNode.put("role", "user");
            userNode.put("content", userInput);
            messages.add(userNode);

            String requestBody = objectMapper.writeValueAsString(rootNode);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            String response = restTemplate.exchange(baseUrl, HttpMethod.POST, entity, String.class).getBody();

//            System.out.println("DeepSeek API Response: " + response);
            if (response == null || response.isEmpty()) {
                System.out.println("DeepSeek API Response is null or empty.");
                return "AI 응답 없음"; // 기본 응답 메시지 설정
            }
            JsonNode responseJson = objectMapper.readTree(response);
            return responseJson.get("choices").get(0).get("message").get("content").asText();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("AI 분석 실패: " + e.getMessage());
        }
    }

    private String getUserTestQuestions() {
        return "1. 기억력에 문제가 있다고 생각하나요?" +
                "2. 기억력이 10년 전보다 나빠졌다고 생각하나요? " +
                "3. 기억력이 같은 또래의 다른 사람들에 비해 나쁘다고 생각하나요? " +
                "4. 기억력 저하로 인해 일상생활에 불편을 느끼나요? " +
                "5. 최근에 일어난 일을 기억하기 어렵나요? " +
                "6. 며칠 전에 나눈 대화 내용을 기억하기 어렵나요? " +
                "7. 며칠 전에 한 약속을 기억하기 어렵나요? " +
                "8. 친한 사람의 이름을 기억하기 어렵나요? " +
                "9. 사용한 물건을 둔 곳을 기억하기 어렵나요? " +
                "10. 이전에 비해 물건을 자주 잃어버리나요? " +
                "11. 집 근처에서 길을 잃은 적이 있나요? " +
                "12. 가게에서 2~3가지 물건을 사려고 할 때 물건 이름을 기억하기 어렵나요? " +
                "13. 가스불이나 전기불 끄는 것을 기억하기 어렵나요? " +
                "14. 자주 사용하는 전화번호(자신 혹은 자녀)를 기억하기 어렵나요?";
    }

    private String getCaregiverTestQuestions() {
        return "1. 전화번호나 사람이름을 기억하기 힘들다."+
                "2. 어떤 일이 언제 일어났는지 기억하지 못할 때가 있다. " +
                "3. 며칠 전에 들었던 이야기를 잊는다. " +
                "4. 오래 전부터 들었던 이야기를 잊는다. " +
                "5. 반복되는 일상 생활에 변화가 생겼을 때 금방 적응하기 힘들다. " +
                "6. 본인에게 중요한 사항을 잊을 때가 있다.(배우자 생일, 결혼기념일 등) " +
                "7. 다른 사람에게 같은 이야기를 반복할 때가 있다. " +
                "8. 어떤 일을 해 놓고도 잊어버려 다시 반복할 때가 있다. " +
                "9. 약속을 해 놓고 잊을 때가 있다. " +
                "10. 이야기 도중 방금 자기가 무슨 이야기를 하고 있었는지 잊을 때가 있다. " +
                "11. 약 먹는 시간을 놓치기도 한다. " +
                "12. 여러 가지 물건을 사러 갔다가 한두 가지를 빠뜨리기도 한다. " +
                "13. 가스 불을 끄는 것을 잊어버리거나 음식을 태운 적이 있다. " +
                "14. 남에게 같은 질문을 반복한다. " +
                "15. 어떤 일을 해 놓고도 했는지 안 했는지 몰라 다시 확인해야 한다. " +
                "16. 물건을 두고 다니거나 또는 가지고 갈 물건을 놓고 간다. " +
                "17. 하고 싶은 말이나 표현이 금방 떠오르지 않는다. " +
                "18. 물건 이름이 금방 생각나지 않는다. " +
                "19. 개인적인 편지나 사무적인 편지를 쓰기 힘들다. " +
                "20. 갈수록 말수가 감소되는 경향이 있다. " +
                "21. 신문이나 잡지를 읽을 때 이야기 줄거리를 파악하지 못한다. " +
                "22. 책을 읽을 때 같은 문장을 여러 번 읽어야 이해가 된다. " +
                "23. 텔레비전에 나오는 이야기를 따라가기 힘들다. " +
                "24. 자주 보는 친구나 친척을 바로 알아보지 못한다. " +
                "25. 물건을 어디에 두고 나중에 어디에 두었는지 몰라 찾게 된다. " +
                "26. 전에 가본 장소를 기억하지 못한다. " +
                "27. 방향감각이 떨어졌다. " +
                "28. 길을 잃거나 헤맨 적이 있다. " +
                "29. 물건을 항상 두는 장소를 잊어버리고 엉뚱한 곳을 찾는다. " +
                "30. 계산 능력이 떨어졌다. " +
                "31. 돈 관리를 하는 데 실수가 있다. " +
                "32. 과거에 쓰던 기구 사용이 서툴러졌다. ";
    }
}
