package com.talktalkcare.domain.games.repository;

import com.talktalkcare.domain.games.entity.DailyCategoryScore;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyGameScore extends JpaRepository<DailyCategoryScore, Long> {

}
