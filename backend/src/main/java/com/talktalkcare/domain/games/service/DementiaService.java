package com.talktalkcare.domain.games.service;

import com.talktalkcare.domain.dementia.dto.DementiaTestDto;
import com.talktalkcare.domain.dementia.entity.DementiaTestResult;
import com.talktalkcare.domain.dementia.repository.DementiaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DementiaService {

    private final DementiaRepository dementiaRepository;

    @Transactional
    public DementiaTestResult saveTestResult(DementiaTestDto dto) {
        // DTO를 엔티티로 변환
        DementiaTestResult testResult = new DementiaTestResult();
        testResult.setUserId(dto.getUserId());
        testResult.setTestId(dto.getTestId());
        testResult.setTestResult(dto.getTestResult());

        // 현재 날짜와 시간 저장 (DATETIME 형식)
        testResult.setTestDate(LocalDateTime.now());

        // 저장 후 반환
        return dementiaRepository.save(testResult);
    }

    /**
     * 클라이언트 요청에 따른 testResult 조회
     * @param requestType "1-2"일 경우 testId 1, 2의 최신 test_result 조회
     *                   "1-1"일 경우 testId 1의 최신 2개 test_result 조회
     * @param userId 사용자 ID
     * @return DementiaTestResult 리스트
     */
    public List<DementiaTestResult> handleRequest(int requestType, int userId) {
        if (requestType ==1 ) {
            // 테스트 ID 1에 대해 최신 두 개의 결과 가져오기
            List<DementiaTestResult> results = dementiaRepository.getLastTwoTestResults(userId);
            return results.size() >= 2 ? results.subList(0, 2) : results;
            }
        if (requestType ==2) {
            // 테스트 ID 1, 2에 대해 최신 결과 가져오기
            return dementiaRepository.fetchDifferentTestTypeResults(userId);

        } else {
            throw new IllegalArgumentException("잘못된 요청 타입입니다: " + requestType);
        }
    }
}
