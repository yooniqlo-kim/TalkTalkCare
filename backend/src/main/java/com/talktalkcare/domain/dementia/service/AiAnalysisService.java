package com.talktalkcare.domain.dementia.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.talktalkcare.domain.dementia.exception.DementiaTestException;
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

    @Value("https://api.deepseek.com/chat/completions")
    private String baseUrl;

    @Value("${deepseek.api.api-key}")
    private String apiKey;

    public AiAnalysisService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    
    //유저-유저 테스트 분석
    public String analyzeTestResults(String inputText) {
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
                    "유저의 자가 치매 진단 테스트 결과 2개를 너에게 보내줄거야. " +
                            "최근과 과거의 자가 치매 진단 테스트 결과를 바탕으로 전체적인 변화와 개선된 점, 주의가 필요한 부분을 요약해서 결론만 알려줘. 모든 문항과 문항 번호를 나열하지 말고, 딱 결론만 보내줘."+
                            "각 문항은 다음과 같고, 문항에 해당되면 1, 해당되지 않으면 0이야." +
                            "1. 기억력에 문제가 있다고 생각하나요? " +
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
                            "14. 자주 사용하는 전화번호(자신 혹은 자녀)를 기억하기 어렵나요?");
            messages.add(systemMessage);
            // "user" 메시지 추가
            ObjectNode userMessage = objectMapper.createObjectNode();
            userMessage.put("role", "user");
            userMessage.put("content", sanitizeInput(inputText));
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
    //유저-보호자 테스트 분석
    public String analyzeTwoTestResults(String inputText) {
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
                "유저의 자가 진단 테스트와 유저 보호자가 진행한 유저의 테스트 결과를 바탕으로 전체적인 변화와 개선된 점, 주의가 필요한 부분을 요약해서 결론만 알려줘. 모든 문항과 문항 번호를 나열하지 말고, 딱 결론만 보내줘."+
                "각 문항은 다음과 같고, 문항에 해당되면 1, 해당되지 않으면 0이야." +

                "type 1:유저가 진행했던 테스트 " +
                "1. 기억력에 문제가 있다고 생각하나요? " +
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
                "14. 자주 사용하는 전화번호(자신 혹은 자녀)를 기억하기 어렵나요?"+
                " " +
                "type 2:보호자가 진행 했던 테스트 " +
                "1. 전화번호나 사람이름을 기억하기 힘들다. " +
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
                "32. 과거에 쓰던 기구 사용이 서툴러졌다. "
            );
            messages.add(systemMessage);
            // "user" 메시지 추가
            ObjectNode userMessage = objectMapper.createObjectNode();
            userMessage.put("role", "user");
            userMessage.put("content", sanitizeInput(inputText));
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
