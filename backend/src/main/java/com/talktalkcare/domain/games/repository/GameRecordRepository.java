package com.talktalkcare.domain.games.repository;

import com.talktalkcare.domain.games.entity.DailyCategoryScore;
import com.talktalkcare.domain.games.entity.GameList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GameRecordRepository extends JpaRepository<DailyCategoryScore, Long> {


}
