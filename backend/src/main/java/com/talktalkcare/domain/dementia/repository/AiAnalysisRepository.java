package com.talktalkcare.domain.dementia.repository;

import com.talktalkcare.domain.dementia.entity.AiDementiaAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AiAnalysisRepository extends JpaRepository<AiDementiaAnalysis, Long> {

    // 특정 userId의 가장 높은 analysisSequence 가져오기
    @Query("SELECT MAX(a.analysisSequence) FROM AiDementiaAnalysis a WHERE a.userId = :userId")
    Optional<Integer> findMaxAnalysisSequenceByUserId(@Param("userId") Integer userId);
}
