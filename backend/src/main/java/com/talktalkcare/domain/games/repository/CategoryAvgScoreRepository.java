package com.talktalkcare.domain.games.repository;

import com.talktalkcare.domain.games.entity.CategoryAvgScore;
import com.talktalkcare.domain.games.entity.CategoryList;
import com.talktalkcare.domain.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryAvgScoreRepository extends JpaRepository<CategoryAvgScore, Integer> {
    Optional<CategoryAvgScore> findByUserAndCategory(User user, CategoryList category);
}
