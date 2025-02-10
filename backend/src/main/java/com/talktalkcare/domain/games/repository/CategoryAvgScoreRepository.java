package com.talktalkcare.domain.games.repository;

import com.talktalkcare.domain.games.entity.CategoryAvgScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryAvgScoreRepository extends JpaRepository<CategoryAvgScore, Integer> {
    Optional<CategoryAvgScore> findByUserIdAndCategoryId(Integer userId, Integer categoryId);
}
