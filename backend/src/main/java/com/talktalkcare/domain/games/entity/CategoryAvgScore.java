package com.talktalkcare.domain.games.entity;

import com.talktalkcare.domain.users.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

@Getter
@Setter
@Entity
@Table(name = "game_category_avg_score")
public class CategoryAvgScore {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "test_id", nullable = false)
    private Integer id;

    @Size(max = 20)
    @NotNull
    @Column(name = "test_name", nullable = false, length = 20)
    private String testName;

    @NotNull
    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    @MapsId
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @MapsId
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private CategoryList category;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "played_count", nullable = false)
    private Short playedCount;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "average", nullable = false)
    private Float average;

}