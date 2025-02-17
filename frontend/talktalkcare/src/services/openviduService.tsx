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
        // 만약 기존 세션이 있다면 종료
        if (this.session) {
          await this.leaveSession();
        }
        // 세션 생성
        this.session = this.OV.initSession();
    
        // (필요 시) session 이벤트 핸들러 추가
        this.session.on('streamCreated', (event) => {
          // 구독자 생성 등 외부에서 별도로 처리할 수 있도록 이벤트 전달
          console.log('새 스트림 생성됨:', event.stream.streamId);
        });
    
        this.session.on('streamDestroyed', (event) => {
          console.log('스트림 종료:', event.stream.streamId);
        });
    
        // ICE 연결 상태 모니터링 추가
        this.session.on('connectionPropertyChanged', (event) => {
          console.log('🌐 연결 상태 변경:', event.connection.connectionId, event.changedProperty);
        });
    
        // 토큰 발급 (세션이 이미 존재하면 409 에러가 발생해도 sessionId를 그대로 사용)
        const token = await this.getToken(sessionId);
    
        // 세션에 연결
        await this.session.connect(token);
    
        // Publisher 초기화 시 타임아웃 설정
        const publisherPromise = new Promise<Publisher>(async (resolve, reject) => {
          try {
            const publisher = await this.OV.initPublisherAsync(undefined, {
              audioSource: undefined,
              videoSource: undefined,
              publishAudio: true,
              publishVideo: true,
              resolution: '640x480',
              frameRate: 30,
              insertMode: 'APPEND',
              mirror: false
            });
            resolve(publisher);
          } catch (error) {
            reject(error);
          }
        });
    
        this.publisher = await Promise.race([
          publisherPromise,
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Publisher 초기화 타임아웃')), 10000)
          )
        ]);
    
        // 스트림 상태 확인
        if (this.publisher.stream) {
          console.log('스트림 정보:', {
            hasAudio: this.publisher.stream.hasAudio,
            hasVideo: this.publisher.stream.hasVideo,
            streamId: this.publisher.stream.streamId,
            connection: this.publisher.stream.connection.connectionId
          });
        }
    
        // 발행 전 연결 상태 확인
        if (this.session.connection && this.session.connection.connectionId) {
          await this.session.publish(this.publisher);
          console.log('✅ 스트림 발행 완료:', this.publisher.stream?.streamId);
        } else {
          throw new Error('세션 연결이 없습니다');
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


