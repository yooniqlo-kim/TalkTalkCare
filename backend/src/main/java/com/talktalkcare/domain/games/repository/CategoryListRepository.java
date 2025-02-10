package com.talktalkcare.domain.games.repository;

import com.talktalkcare.domain.games.entity.CategoryList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CategoryListRepository extends JpaRepository<CategoryList, Integer> {

    @Query("SELECT c.categoryId FROM GameList c WHERE c.id = :gameId")
    Integer findCategoryIdByGameId(@Param("gameId") Integer gameId);
}
