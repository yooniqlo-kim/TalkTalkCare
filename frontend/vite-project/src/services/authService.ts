// src/services/authService.ts
import axios from 'axios';
import { UserSignupRequest, SignupApiResponse, SmsVerificationRequest } from '../types/user';

const BASE_URL = 'http://localhost:8443/api'; // 백엔드 API 기본 URL

export const authService = {
  // 아이디 중복 확인 메서드 추가
  checkIdDuplicate: async (id: string): Promise<boolean> => {
    try {
      const response = await axios.get(`${BASE_URL}/users/check-id`, {
        params: { id }
      });
      return response.data.isDuplicate === false;
    } catch (error) {
      console.error('아이디 중복 확인 중 오류:', error);
      throw error;
    }
  },

  sendSmsVerification: async (phoneNumber: string) => {
    try {
      const response = await axios.post(`${BASE_URL}/sms/send`, 
        { phoneNumber },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('SMS 인증번호 요청 실패:', error);
      throw error;
    }
  },

  verifySmsCode: async (phoneNumber: string, verificationCode: string) => {
    try {
      const response = await axios.post(`${BASE_URL}/sms/verify`, 
        { 
          phoneNumber, 
          verificationCode 
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('SMS 인증번호 검증 실패:', error);
      throw error;
    }
  },

  signup: async (userData: UserSignupRequest) => {
    try {
      const response = await axios.post<SignupApiResponse>(`${BASE_URL}/users/signup`, userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('회원가입 실패:', error);
      throw error;
    }
  }
};