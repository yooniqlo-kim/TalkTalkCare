package com.talktalkcare.domain.users.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Duration;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class FriendDto {
    private Integer userId;
    private String name;
    private String s3Filename;
    private String status;  // "ONLINE" or "OFFLINE"
    private LocalDateTime lastActiveTime;
    private String displayStatus;

    public static FriendDto from(Integer userId, String name, String s3Filename,
                                 boolean isOnline, LocalDateTime lastActiveTime) {
        String status = isOnline ? "ONLINE" : "OFFLINE";
        String displayStatus = createDisplayStatus(lastActiveTime);
        return new FriendDto(
                userId,
                name,
                s3Filename,
                status,
                lastActiveTime,
                displayStatus
        );
    }

    // 기존 사용자 정보와 상태 정보를 합치는 정적 메소드 추가
    public static FriendDto of(UserDto userDto, boolean isOnline, LocalDateTime lastActiveTime) {
        String status = isOnline ? "ONLINE" : "OFFLINE";
        String displayStatus = createDisplayStatus(lastActiveTime);
        return new FriendDto(
                userDto.getLoginId(),
                userDto.getName(),
                userDto.getS3Filename(),
                status,
                lastActiveTime,
                displayStatus
        );
    }

    private static String createDisplayStatus(LocalDateTime lastActiveTime) {
        if (lastActiveTime == null) return "오프라인";

        Duration duration = Duration.between(lastActiveTime, LocalDateTime.now());
        if (duration.toMinutes() < 60) {
            return duration.toMinutes() + "분 전";
        } else if (duration.toHours() < 24) {
            return duration.toHours() + "시간 전";
        }
        return duration.toDays() + "일 전";
    }
}
