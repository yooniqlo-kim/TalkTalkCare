package com.talktalkcare.domain.games.service;

import com.talktalkcare.domain.games.dto.GameRecordDto;
import com.talktalkcare.domain.games.entity.DailyCategoryScore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DailyGameService {

    @Transactional
    public DailyCategoryScore saveGameResult(GameRecordDto dto) {
        DailyCategoryScore result = new DailyCategoryScore();
        result.setId(dto.getUserId());
        result.set


    }
}
