package com.talktalkcare.domain.games.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GameCategoryDto {

    //테스트 ai 요약본
    private int userId;
    private String summary;
    private int analysisType;  // 테스트 타입
    private int analysisSeq;

}