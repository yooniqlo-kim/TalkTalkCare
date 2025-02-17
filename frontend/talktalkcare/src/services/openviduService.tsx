import { Component } from 'react';
import {OpenVidu,Session,Publisher,StreamManager,Subscriber} from 'openvidu-browser';

class OpenviduService {
    private OV: OpenVidu;
    private session: Session | null = null;
    private publisher: Publisher | null = null;
  
    constructor() {
      this.OV = new OpenVidu();
      this.OV.enableProdMode();
    }
  

    async joinSession(sessionId: string): Promise<{ session: Session; publisher: Publisher }> {
      try {
        if (this.session) {
          await this.leaveSession();
        }

        this.session = this.OV.initSession();
        
        // 이벤트 핸들러 등록
        this.session.on('streamCreated', (event) => {
          console.log('새 스트림 생성됨:', event.stream.streamId);
        });

        this.session.on('streamDestroyed', (event) => {
          console.log('스트림 종료:', event.stream.streamId);
        });

        // 토큰 발급 및 세션 연결
        const token = await this.getToken(sessionId);
        await this.session.connect(token);

        // Publisher 초기화
        console.log('🎥 Publisher 초기화 시작');
        this.publisher = await this.OV.initPublisherAsync(undefined, {
          audioSource: undefined,
          videoSource: undefined,
          publishAudio: true,
          publishVideo: true,
          resolution: '640x480',
          frameRate: 30,
          insertMode: 'APPEND',
          mirror: false
        });
        console.log('✅ Publisher 초기화 완료');

        // 스트림 발행 전 검증
        if (!this.session || !this.publisher) {
          throw new Error('세션 또는 Publisher가 없습니다');
        }

        // 스트림 발행
        console.log('📡 스트림 발행 시작');
        await this.session.publish(this.publisher);
        console.log('✅ 스트림 발행 완료');

        // 스트림 정보 로깅 (옵션)
        if (this.publisher.stream) {
          console.log('스트림 정보:', {
            hasAudio: this.publisher.stream.hasAudio,
            hasVideo: this.publisher.stream.hasVideo,
            streamId: this.publisher.stream.streamId
          });
        }

        return { session: this.session, publisher: this.publisher };
      } catch (error) {
        console.error('❌ 세션 참가 중 오류:', error);
        throw error;
      }
    }
  
    async leaveSession() {
      if (this.session) {
        this.session.disconnect();
      }
      this.session = null;
      this.publisher = null;
    }
  
    // OpenVidu 세션 생성 API 호출 (프록시를 통해 호출)
    private async createSession(sessionId: string): Promise<string> {
      const response = await fetch('https://www.talktalkcare.com/openvidu/api/sessions', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa('OPENVIDUAPP:talktalkcare'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customSessionId: sessionId }),
        credentials: 'include'
      });
  
      console.log('세션 생성 응답:', response.status);
  
      // 409: 이미 존재하는 경우 정상 처리
      if (response.status === 409) {
        console.log('세션이 이미 존재함:', sessionId);
        return sessionId;
      }
  
      if (!response.ok) {
        console.error('세션 생성 실패:', response.status, await response.text());
        return sessionId;
      }
  
      const data = await response.json();
      console.log('세션 생성 성공:', data.id);
      return data.id;
    }
  
    // OpenVidu 토큰 생성 API 호출
    private async createToken(sessionId: string): Promise<string> {
      const response = await fetch(`https://www.talktalkcare.com/openvidu/api/sessions/${sessionId}/connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('OPENVIDUAPP:talktalkcare')
        },
        credentials: 'include'
      });
  
      console.log('토큰 생성 응답:', response.status);
      if (!response.ok) {
        console.error('토큰 생성 실패:', response.status, await response.text());
        throw new Error(`토큰 생성 실패: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('토큰 생성 성공:', data.token);
      return data.token;
    }
  
    private async getToken(sessionId: string): Promise<string> {
      const sid = await this.createSession(sessionId);
      return await this.createToken(sid);
    }
  }
  
  export default new OpenviduService();


