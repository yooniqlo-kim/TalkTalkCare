package com.talktalkcare.domain.games.service;

import com.talktalkcare.domain.games.dto.GameRecordDto;
import com.talktalkcare.domain.games.entity.CategoryAvgScore;
import com.talktalkcare.domain.games.entity.CategoryList;
import com.talktalkcare.domain.games.entity.DailyCategoryScore;
import com.talktalkcare.domain.games.repository.CategoryAvgScoreRepository;
import com.talktalkcare.domain.games.repository.CategoryListRepository;
import com.talktalkcare.domain.games.repository.GameRecordRepository;
import com.talktalkcare.domain.users.entity.User;
import com.talktalkcare.domain.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GameRecordService {

    private final GameRecordRepository gameRecordRepository;
    private final CategoryListRepository categoryListRepository;
    private final CategoryAvgScoreRepository categoryAvgScoreRepository;
    private final UserRepository userRepository;

    @Transactional
    public DailyCategoryScore saveGameResult(GameRecordDto dto) {
        // 게임 기록 저장
        DailyCategoryScore result = new DailyCategoryScore();
        result.setId(dto.getUserId());
        result.setGameId(dto.getGameId());
        result.setPlayedAt(LocalDateTime.now());

        gameRecordRepository.save(result);

        // 해당 게임이 속한 카테고리 찾기
        Optional<CategoryList> categoryOpt = categoryListRepository.findByGameId(dto.getGameId());
        if (categoryOpt.isPresent()) {
            CategoryList category = categoryOpt.get();

            // 사용자 조회
            Optional<User> userOpt = userRepository.findById(dto.getUserId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();

                // 기존 카테고리 점수 조회
                Optional<CategoryAvgScore> categoryScoreOpt = categoryAvgScoreRepository.findByUserAndCategory(user, category);

                CategoryAvgScore categoryScore;
                categoryScore = categoryScoreOpt.get();
                // 플레이 횟수 증가
                categoryScore.setPlayedCount((short) (categoryScore.getPlayedCount() + 1));

                // 평균 점수 갱신
                float newAverage = ((categoryScore.getAverage() * (categoryScore.getPlayedCount() - 1)) + dto.getScore()) / categoryScore.getPlayedCount();
                categoryScore.setAverage(newAverage);

                // 변경 사항 저장
                categoryAvgScoreRepository.save(categoryScore);
            }
        }

        return result;
    }
}
