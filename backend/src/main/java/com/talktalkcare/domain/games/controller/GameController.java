package com.talktalkcare.domain.games.controller;

import com.talktalkcare.common.response.Api;
import com.talktalkcare.domain.games.dto.GameRecordDto;
import com.talktalkcare.domain.games.service.GameRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
public class GameController {

    private final GameRecordService gameRecordService;

    @PostMapping("/game-result")
    public Api<String> saveTestResult(@RequestBody GameRecordDto dto) {
        gameRecordService.saveGameResult(dto);
        return Api.OK("게임 결과 전송 완료");
    }

/*    @GetMapping("/category-average")
    public Api<?> getCategoryAverageScore(@PathVariable Integer userId) {
        try {
            CategoryAvgScoreDto categoryAvgScore = gameRecordService.getCategoryAverageScoreByGameId(userId);
            return ResponseEntity.ok(categoryAvgScore);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("Failed to retrieve category average score"));
        }
    }*/
}
