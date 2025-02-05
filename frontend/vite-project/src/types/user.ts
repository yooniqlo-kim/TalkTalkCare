// src/types/user.ts

// 회원가입 요청 데이터 타입
export interface UserSignupRequest {
  name: string;
  id: string;
  nickname: string;
  password: string;
  phoneNumber: string;
  birthdate: string;
  passwordConfirm?: string; // 선택적 속성으로 추가
  smsVerified?: boolean; // SMS 인증 상태 추가
}

// 회원가입 API 응답 타입
export interface SignupApiResponse {
  success: boolean;
  message: string;
  userId?: string;
}

// SMS 인증 관련 타입
export interface SmsVerificationRequest {
  phoneNumber: string;
  verificationCode: string;
}

// 사용자 정보 타입
export interface User {
  id: string;
  name: string;
  nickname: string;
  phoneNumber: string;
  birthdate: string;
  profileImageUrl?: string;
}