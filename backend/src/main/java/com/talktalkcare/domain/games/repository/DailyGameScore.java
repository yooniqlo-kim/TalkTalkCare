package com.talktalkcare.domain.games.repository;

import com.talktalkcare.domain.games.entity.DailyCategoryScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DailyGameScore extends JpaRepository<DailyCategoryScore, Long> {

}
