package com.talktalkcare.domain.dementia.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "ai_dementia_analysis")
public class AiDementiaAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "analysis_id", nullable = false)
    private Integer id;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @NotNull
    @Lob
    @Column(name = "analysis_result", nullable = false)
    private String analysisResult;

    @NotNull
    @Column(name = "analysis_type", nullable = false)
    private int analysisType;

    @NotNull
    @Column(name = "analysis_sequence", nullable = false)
    private Integer analysisSequence;

}