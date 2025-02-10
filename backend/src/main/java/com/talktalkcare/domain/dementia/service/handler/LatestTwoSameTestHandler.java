package com.talktalkcare.domain.dementia.service.handler;

import com.talktalkcare.domain.dementia.dto.RequestType;
import com.talktalkcare.domain.dementia.entity.DementiaTestResult;
import com.talktalkcare.domain.dementia.repository.DementiaRepository;
import com.talktalkcare.domain.dementia.service.AiAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class LatestTwoSameTestHandler implements RequestTypeHandler {
    private final DementiaRepository dementiaRepository;
    private final AiAnalysisService aiAnalysisService;

    @Override
    public RequestType getRequestType() {
        return RequestType.LATEST_TWO_SAME_TEST;
    }

    @Override
    public List<DementiaTestResult> handleRequest(Integer userId) {
        List<DementiaTestResult> results = dementiaRepository.getLastTwoTestResults(userId);
        return results.size() >= 2 ? results.subList(0, 2) : results;
    }


    @Override
    public String analyzeTestResults(Integer userId, List<DementiaTestResult> testResults) {
        String prompt = generatePrompt();
        String testResult = buildAnalysisInput(testResults);

        int value = getRequestType().getValue();

        return aiAnalysisService.analyzeTestResults(userId, prompt, testResult, value);
    }

    @Override
    public String generatePrompt() {
        return "유저의 치매 진단 테스트 결과를 분석할 거야."
                + "유저의 최근과 과거의 자가 치매 진단 테스트 결과를 비교하여 변화와 개선점, 주의할 부분을 요약해줘."
                + "모든 문항과 문항 번호를 나열하지 말고, 결론만 간결하게 3문장 이내로 알려줘."
                + "\n테스트 문항:\n" + getTestQuestions();
    }

    @Override
    public String buildAnalysisInput(List<DementiaTestResult> testResults) {
        return new StringBuilder()
                .append("최근한 테스트 결과: ").append(testResults.get(0).getTestResult()).append("\n\n")
                .append("이전 테스트 결과: ").append(testResults.get(1).getTestResult()).append("\n\n")
                .toString();
    }

    private String getTestQuestions() {
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
}


