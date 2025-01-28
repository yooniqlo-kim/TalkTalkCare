package com.talktalkcare.domain.dementia.service;

import com.talktalkcare.domain.dementia.entity.DementiaTestResult;
import com.talktalkcare.domain.dementia.repository.DementiaRepository;
import com.talktalkcare.domain.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DementiaService {

    private final DementiaRepository dementiaRepository;


    @Autowired
    public DementiaService(DementiaRepository dementiaRepository) {
        this.dementiaRepository = dementiaRepository;
    }

    /**
     * 클라이언트 요청에 따른 testResult 조회
     * @param requestType "smcq-sdq"일 경우 testId 1, 2의 최신 test_result 조회
     *                   "sdq-sdq"일 경우 testId 1의 최신 2개 test_result 조회
     * @param userId 사용자 ID
     * @return DementiaTestResult 리스트
     */
    public List<DementiaTestResult> handleRequest(String requestType, int userId) {
        if ("1-2".equalsIgnoreCase(requestType)) {
            // 테스트 ID 1, 2에 대해 최신 결과 가져오기
            return dementiaRepository.fetchDifferentTestTypeResults(userId);
        } else if ("1-1".equalsIgnoreCase(requestType)) {
            // 테스트 ID 1에 대해 최신 두 개의 결과 가져오기
            List<DementiaTestResult> results = dementiaRepository.getLastTwoTestResults(userId);
            return results.size() >= 2 ? results.subList(0, 2) : results;
        } else {
            throw new IllegalArgumentException("잘못된 요청 타입입니다: " + requestType);
        }
    }
}


