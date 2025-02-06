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
public class DementiaAiDto {

    //테스트 ai 요약본
    private int userId;
    private String summary;
    private boolean analysisType;  // 테스트 타입
    private int analysisSeq;

}