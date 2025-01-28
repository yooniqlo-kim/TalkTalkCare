package com.talktalkcare.domain.dementia.service;

import com.talktalkcare.domain.dementia.error.DementiaTestErrorCode;
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
        String url = baseUrl;
        // JSON Body 생성
        String requestBody = "{\n" +
                "    \"model\": \"deepseek-chat\",\n" +
                "    \"messages\": [\n" +
                "        {\"role\": \"system\", \"content\": \"" +
                "자가 치매 진단 테스트의 문항은 다음과 같아." +
                "유저가 테스트한 2개의 결과를 너에게 보내줄거야. 문항에 해당되면 1, 해당되지 않으면 0이야." +
                "첫 번째는 최근 테스트한 결과고, 두 번째는 과거 테스트한 결과야. " +
                "두 결과를 바탕으로 비교 분석후 요약해서 알려줘\n" +
                "1. 전화번호나 사람이름을 기억하기 힘들다.\n" +
                "2. 어떤 일이 언제 일어났는지 기억하지 못할 때가 있다.\n" +
                "3. 며칠 전에 들었던 이야기를 잊는다.\n" +
                "4. 오래 전부터 들었던 이야기를 잊는다.\n" +
                "5. 반복되는 일상 생활에 변화가 생겼을 때 금방 적응하기 힘들다.\n" +
                "6. 본인에게 중요한 사항을 잊을 때가 있다.(배우자 생일, 결혼기념일 등)\n" +
                "7. 다른 사람에게 같은 이야기를 반복할 때가 있다.\n" +
                "8. 어떤 일을 해 놓고도 잊어버려 다시 반복할 때가 있다.\n" +
                "9. 약속을 해 놓고 잊을 때가 있다.\n" +
                "10. 이야기 도중 방금 자기가 무슨 이야기를 하고 있었는지 잊을 때가 있다.\n" +
                "11. 약 먹는 시간을 놓치기도 한다.\n" +
                "12. 여러 가지 물건을 사러 갔다가 한두 가지를 빠뜨리기도 한다.\n" +
                "13. 가스 불을 끄는 것을 잊어버리거나 음식을 태운 적이 있다.\n" +
                "14. 남에게 같은 질문을 반복한다.\n" +
                "15. 어떤 일을 해 놓고도 했는지 안 했는지 몰라 다시 확인해야 한다.\n" +
                "16. 물건을 두고 다니거나 또는 가지고 갈 물건을 놓고 간다.\n" +
                "17. 하고 싶은 말이나 표현이 금방 떠오르지 않는다.\n" +
                "18. 물건 이름이 금방 생각나지 않는다.\n" +
                "19. 개인적인 편지나 사무적인 편지를 쓰기 힘들다.\n" +
                "20. 갈수록 말수가 감소되는 경향이 있다.\n" +
                "21. 신문이나 잡지를 읽을 때 이야기 줄거리를 파악하지 못한다.\n" +
                "22. 책을 읽을 때 같은 문장을 여러 번 읽어야 이해가 된다.\n" +
                "23. 텔레비전에 나오는 이야기를 따라가기 힘들다.\n" +
                "24. 자주 보는 친구나 친척을 바로 알아보지 못한다.\n" +
                "25. 물건을 어디에 두고 나중에 어디에 두었는지 몰라 찾게 된다.\n" +
                "26. 전에 가본 장소를 기억하지 못한다.\n" +
                "27. 방향감각이 떨어졌다.\n" +
                "28. 길을 잃거나 헤맨 적이 있다.\n" +
                "29. 물건을 항상 두는 장소를 잊어버리고 엉뚱한 곳을 찾는다.\n" +
                "30. 계산 능력이 떨어졌다.\n" +
                "31. 돈 관리를 하는 데 실수가 있다.\n" +
                "32. 과거에 쓰던 기구 사용이 서툴러졌다.\"},\n" +
                "        {\"role\": \"user\", \"content\": \"" + inputText + "\"}\n" +
                "    ],\n" +
                "    \"stream\": false\n" +
                "}";

        // HttpHeaders 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey); // API Key를 Authorization 헤더에 추가

        // HttpEntity 설정
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        try {
            // RestTemplate을 사용하여 POST 요청 보내기
            String response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class).getBody();
            System.out.println("API 호출 성공, 응답: " + response);
            return response;
        } catch (Exception e) {
            // 예외 처리
            e.printStackTrace();
            throw new DementiaTestException(DementiaTestErrorCode.INVALID_API_RESPONSE);
        }
    }

    //유저-보호자 테스트 분석
    public String analyzeTwoTestResults(String inputText) {
        String url = baseUrl;

        // JSON Body 생성
        String requestBody = "{\n" +
                "    \"model\": \"deepseek-chat\",\n" +
                "    \"messages\": [\n" +
                "        {\"role\": \"system\", \"content\": \"" +

                "type 1:유저가 진행했던 테스트\n" +
                "1. 전화번호나 사람이름을 기억하기 힘들다.\n" +
                "2. 어떤 일이 언제 일어났는지 기억하지 못할 때가 있다.\n" +
                "3. 며칠 전에 들었던 이야기를 잊는다.\n" +
                "4. 오래 전부터 들었던 이야기를 잊는다.\n" +
                "5. 반복되는 일상 생활에 변화가 생겼을 때 금방 적응하기 힘들다.\n" +
                "6. 본인에게 중요한 사항을 잊을 때가 있다.(배우자 생일, 결혼기념일 등)\n" +
                "7. 다른 사람에게 같은 이야기를 반복할 때가 있다.\n" +
                "8. 어떤 일을 해 놓고도 잊어버려 다시 반복할 때가 있다.\n" +
                "9. 약속을 해 놓고 잊을 때가 있다.\n" +
                "10. 이야기 도중 방금 자기가 무슨 이야기를 하고 있었는지 잊을 때가 있다.\n" +
                "11. 약 먹는 시간을 놓치기도 한다.\n" +
                "12. 여러 가지 물건을 사러 갔다가 한두 가지를 빠뜨리기도 한다.\n" +
                "13. 가스 불을 끄는 것을 잊어버리거나 음식을 태운 적이 있다.\n" +
                "14. 남에게 같은 질문을 반복한다.\n" +
                "15. 어떤 일을 해 놓고도 했는지 안 했는지 몰라 다시 확인해야 한다.\n" +
                "16. 물건을 두고 다니거나 또는 가지고 갈 물건을 놓고 간다.\n" +
                "17. 하고 싶은 말이나 표현이 금방 떠오르지 않는다.\n" +
                "18. 물건 이름이 금방 생각나지 않는다.\n" +
                "19. 개인적인 편지나 사무적인 편지를 쓰기 힘들다.\n" +
                "20. 갈수록 말수가 감소되는 경향이 있다.\n" +
                "21. 신문이나 잡지를 읽을 때 이야기 줄거리를 파악하지 못한다.\n" +
                "22. 책을 읽을 때 같은 문장을 여러 번 읽어야 이해가 된다.\n" +
                "23. 텔레비전에 나오는 이야기를 따라가기 힘들다.\n" +
                "24. 자주 보는 친구나 친척을 바로 알아보지 못한다.\n" +
                "25. 물건을 어디에 두고 나중에 어디에 두었는지 몰라 찾게 된다.\n" +
                "26. 전에 가본 장소를 기억하지 못한다.\n" +
                "27. 방향감각이 떨어졌다.\n" +
                "28. 길을 잃거나 헤맨 적이 있다.\n" +
                "29. 물건을 항상 두는 장소를 잊어버리고 엉뚱한 곳을 찾는다.\n" +
                "30. 계산 능력이 떨어졌다.\n" +
                "31. 돈 관리를 하는 데 실수가 있다.\n" +
                "32. 과거에 쓰던 기구 사용이 서툴러졌다.\n" +
                "\n" +
                "type 2:보호자가 진행 했던 테스트\n" +
                "1. 기억력에 문제가 있다고 생각하나요?\n" +
                "2. 기억력이 10년 전보다 나빠졌다고 생각하나요?\n" +
                "3. 기억력이 같은 또래의 다른 사람들에 비해 나쁘다고 생각하나요?\n" +
                "4. 기억력 저하로 인해 일상생활에 불편을 느끼나요?\n" +
                "5. 최근에 일어난 일을 기억하기 어렵나요?\n" +
                "6. 며칠 전에 나눈 대화 내용을 기억하기 어렵나요?\n" +
                "7. 며칠 전에 한 약속을 기억하기 어렵나요?\n" +
                "8. 친한 사람의 이름을 기억하기 어렵나요?\n" +
                "9. 사용한 물건을 둔 곳을 기억하기 어렵나요?\n" +
                "10. 이전에 비해 물건을 자주 잃어버리나요?\n" +
                "11. 집 근처에서 길을 잃은 적이 있나요?\n" +
                "12. 가게에서 2~3가지 물건을 사려고 할 때 물건 이름을 기억하기 어렵나요?\n" +
                "13. 가스불이나 전기불 끄는 것을 기억하기 어렵나요?\n" +
                "14. 자주 사용하는 전화번호(자신 혹은 자녀)를 기억하기 어렵나요?\"}," +
                "위 두개에 문항에 대한 결과를 문항에 해당되면 1, 해당되지 않으면 0으로 보내줄게. " +
                "유저가 자가 진단 테스트와 유저 보호자가 진행한 유저의 테스트를 비교해서 분석하고 요약해서 보내줘\n" +
                "        {\"role\": \"user\", \"content\": \"" + inputText + "\"}\n" +
                "    ],\n" +
                "    \"stream\": false\n" +
                "}";

        // HttpHeaders 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey); // API Key를 Authorization 헤더에 추가

        // HttpEntity 설정
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        try {
            // RestTemplate을 사용하여 POST 요청 보내기
            String response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class).getBody();
            System.out.println("API 호출 성공, 응답: " + response);
            return response;
        } catch (Exception e) {
            // 예외 처리
            e.printStackTrace();
            throw new DementiaTestException(DementiaTestErrorCode.INVALID_API_RESPONSE);
        }
    }
}
