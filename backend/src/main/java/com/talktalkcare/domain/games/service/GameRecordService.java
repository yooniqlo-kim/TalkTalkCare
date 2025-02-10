package com.talktalkcare.domain.games.service;

import com.talktalkcare.domain.games.dto.GameRecordDto;
import com.talktalkcare.domain.games.entity.CategoryAvgScore;
import com.talktalkcare.domain.games.entity.DailyCategoryScore;
import com.talktalkcare.domain.games.repository.CategoryAvgScoreRepository;
import com.talktalkcare.domain.games.repository.CategoryListRepository;
import com.talktalkcare.domain.games.repository.GameRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameRecordService {

    private final GameRecordRepository gameRecordRepository;
    private final CategoryListRepository categoryListRepository;
    private final CategoryAvgScoreRepository categoryAvgScoreRepository;

    @Transactional
    public DailyCategoryScore saveGameResult(GameRecordDto dto) {
        System.out.println(dto);

        // 게임 기록 저장
        DailyCategoryScore result = new DailyCategoryScore();
        result.setUserId(dto.getUserId());
        result.setGameId(dto.getGameId());
        result.setScore((short)dto.getScore());
        result.setPlayedAt(LocalDateTime.now());

        // 게임 기록 저장
        gameRecordRepository.save(result);

        // 해당 게임이 속한 카테고리 찾기
        Integer categoryId = categoryListRepository.findCategoryIdByGameId(dto.getGameId());
        if (categoryId == null) {
            throw new RuntimeException("해당 게임에 대한 카테고리가 존재하지 않습니다.");
        }

        // 기존 카테고리 점수 조회
        Optional<CategoryAvgScore> categoryScoreOpt = categoryAvgScoreRepository.findByUserIdAndCategoryId(dto.getUserId(), categoryId);
        CategoryAvgScore categoryScore;

        if (categoryScoreOpt.isPresent()) {
            // 기존 객체 업데이트
            categoryScore = categoryScoreOpt.get();
            categoryScore.setPlayedCount((short) (categoryScore.getPlayedCount() + 1));
            float newAverage = ((categoryScore.getAverage() * (categoryScore.getPlayedCount() - 1)) + dto.getScore()) / categoryScore.getPlayedCount();
            categoryScore.setAverage(newAverage);

        } else {
            // 새로운 객체 생성
            categoryScore = new CategoryAvgScore();
            categoryScore.setUserId(dto.getUserId());
            categoryScore.setCategoryId(categoryId);
            categoryScore.setPlayedCount((short) 1);
            categoryScore.setAverage((float) dto.getScore());
        }

// 변경 사항 저장
        categoryAvgScoreRepository.save(categoryScore);


        return result;
    }
}
