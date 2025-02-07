package com.talktalkcare.domain.games.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "game_category_score_per_month")
public class MonthlyCategoryScore {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_id", nullable = false)
    private Integer num;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @NotNull
    @Column(name = "test_id", nullable = false)
    private Integer testId;

    @NotNull
    @Lob
    @Column(name = "test_result", nullable = false)
    private String testResult;

    @NotNull
    @Column(name = "test_date", nullable = false)
    private LocalDateTime testDate;  // LocalDateTime으로 변경
}