package com.talktalkcare.domain.games.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "game_score_per_day")
public class DailyCategoryScore {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @Column(name = "game_id", nullable = false)
    private Integer gameId;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "score", nullable = false)
    private Short score;

    @NotNull
    @Column(name = "played_at", nullable = false,columnDefinition = "TIMESTAMP")
    private Instant playedAt;

}