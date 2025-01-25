package com.talktalkcare.domain.dementia.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name="user_security")
public class AiDementiaAnalysis {

    @Id
    private String userLoginId;

    @NotNull
    private String salt;
}
