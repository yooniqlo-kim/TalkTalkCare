package com.talktalkcare.domain.games.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GameRecordDto {

    private int userId;
    private int testId;  // 테스트 타입
    private String testResult; // 테스트 결과

}