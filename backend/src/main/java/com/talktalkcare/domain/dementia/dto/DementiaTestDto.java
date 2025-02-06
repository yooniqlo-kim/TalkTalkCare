package com.talktalkcare.domain.dementia.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DementiaTestDto {

    private int userId;
    private int testId;  // 테스트 타입
    private String testResult; // 테스트 결과

}