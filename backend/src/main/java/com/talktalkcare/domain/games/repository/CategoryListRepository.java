package com.talktalkcare.domain.games.repository;

import com.talktalkcare.domain.games.entity.CategoryList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryListRepository extends JpaRepository<CategoryList, Integer> {
    Optional<CategoryList> findByGameId(Integer gameId);
}
