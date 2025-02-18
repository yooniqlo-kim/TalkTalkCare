import { Component } from 'react';
import { OpenVidu, Session, Publisher, StreamManager, Subscriber } from 'openvidu-browser';

class OpenviduService {
  private OV: OpenVidu;
  private session: Session | null = null;
  private publisher: Publisher | null = null;

  constructor() {
    console.log('[OpenviduService] 생성자 호출');
    this.OV = new OpenVidu();
    this.OV.enableProdMode();
    // ICE 서버 설정을 별도의 변수로 정의
    const iceServers = [
      {
        urls: "stun:talktalkcare.com:3478"
      },
      {
        // TURN 서버의 TLS 포트가 Docker 설정상 5349로 매핑되어 있으므로 turns:...:5349를 사용
        urls: "turns:talktalkcare.com:5349",
        username: "turnuser",
        credential: "turnpassword"
      }
    ];

    // ICE 서버 설정 적용
    this.OV.setAdvancedConfiguration({
      iceServers: iceServers,
    });

    console.log('[OpenviduService] ICE 서버 설정 완료', { iceServers: iceServers });
  }

  async joinSession(sessionId: string): Promise<{ session: Session; publisher: Publisher }> {
    console.log('[joinSession] 시작: sessionId =', sessionId);
    try {
      // 기존 세션이 있다면 종료
      if (this.session) {
        console.log('[joinSession] 기존 세션이 존재함. 종료합니다.');
        await this.leaveSession();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      this.session = this.OV.initSession();
      console.log('[joinSession] 세션 초기화 성공:', this.session);

      // 이벤트 로깅 추가
      this.session.on('streamCreated', async (event: any) => {
        console.log('[joinSession] streamCreated 이벤트 발생:', event);
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (!this.session) {
          console.error('[joinSession] streamCreated 처리 중 세션이 없음');
          return;
        }

        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
          try {
            console.log(`[joinSession] 스트림 구독 시도 ${retryCount + 1}번째: streamId=${event.stream.streamId}`);
            const subscriber = await this.session.subscribe(event.stream, undefined);
            console.log(`[joinSession] ✅ 구독 성공 (시도 ${retryCount + 1}): streamId=${subscriber.stream?.streamId}`);
            return subscriber;
          } catch (error) {
            retryCount++;
            console.error(`[joinSession] ❌ 구독 시도 ${retryCount} 실패:`, error);
            if (retryCount < maxRetries) {
              console.log(`[joinSession] ${retryCount}초 후 재시도합니다.`);
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
          }
        }
      });

      this.session.on('streamDestroyed', (event: any) => {
        console.log('[joinSession] streamDestroyed 이벤트 발생:', event);
      });

      // 세션 연결 전 WebSocket 이벤트 에러 로깅 추가
      this.session.on('exception', (exception: any) => {
        console.error('[joinSession] 세션 예외 발생:', exception);
      });

      // 토큰 발급 및 세션 연결
      console.log('[joinSession] 토큰 발급 시작');
      const token = await this.getToken(sessionId);
      console.log('[joinSession] 발급받은 토큰:', token);
      
      console.log('[joinSession] session.connect() 호출 전, token=', token);
      await this.session.connect(token);
      console.log('[joinSession] session.connect() 성공');

      // Publisher 초기화
      console.log('[joinSession] 🎥 Publisher 초기화 시작');
      this.publisher = await this.OV.initPublisherAsync(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: true,
        publishVideo: true,
        resolution: '640x480',
        frameRate: 30,
        insertMode: 'APPEND',
        mirror: false,
        videoSimulcast: false
      });
      console.log('[joinSession] ✅ Publisher 초기화 완료:', this.publisher);

      if (!this.publisher || !this.session) {
        throw new Error('Publisher 또는 Session 초기화 실패');
      }

      console.log('[joinSession] 스트림 발행 전 publisher=', this.publisher);
      await this.session.publish(this.publisher);
      console.log('[joinSession] ✅ 스트림 발행 완료');

      if (this.publisher.stream) {
        console.log('[joinSession] 스트림 정보:', {
          hasAudio: this.publisher.stream.hasAudio,
          hasVideo: this.publisher.stream.hasVideo,
          streamId: this.publisher.stream.streamId
        });
      }

      return { session: this.session, publisher: this.publisher };
    } catch (error) {
      console.error('[joinSession] 세션 참가 중 오류:', error);
      await this.leaveSession();
      throw error;
    }
  }

  async leaveSession() {
    console.log('[leaveSession] 호출됨');
    if (this.session) {
      this.session.disconnect();
      console.log('[leaveSession] 세션 disconnect() 호출 완료');
    }
    this.session = null;
    this.publisher = null;
  }

  // OpenVidu 세션 생성 API 호출
  private async createSession(sessionId: string): Promise<string> {
    console.log('[createSession] 세션 생성 요청: sessionId=', sessionId);
    const response = await fetch('https://www.talktalkcare.com/openvidu/api/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa('OPENVIDUAPP:talktalkcare'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customSessionId: sessionId }),
      credentials: 'include'
    });

    console.log('[createSession] 응답 상태:', response.status);

    // 409: 이미 존재하는 경우
    if (response.status === 409) {
      console.log('[createSession] 세션이 이미 존재함:', sessionId);
      return sessionId;
    }

    if (!response.ok) {
      const text = await response.text();
      console.error('[createSession] 세션 생성 실패:', response.status, text);
      throw new Error(`세션 생성 실패: ${response.status} - ${text}`);
    }

    const data = await response.json();
    console.log('[createSession] 세션 생성 성공:', data.id);
    return data.id;
  }

  // OpenVidu 토큰 생성 API 호출
  private async createToken(sessionId: string): Promise<string> {
    console.log('[createToken] 토큰 생성 요청: sessionId=', sessionId);
    try {
      const response = await fetch(`https://www.talktalkcare.com/openvidu/api/sessions/${sessionId}/connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('OPENVIDUAPP:talktalkcare')
        },
        credentials: 'include'
      });
      console.log('[createToken] 응답 상태:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[createToken] 토큰 생성 실패:', errorText);
        throw new Error(`토큰 생성 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('[createToken] 토큰 생성 성공:', data.token);
      return data.token;
    } catch (error) {
      console.error('[createToken] 예외 발생:', error);
      throw error;
    }
  }

  private async getToken(sessionId: string): Promise<string> {
    console.log('[getToken] 시작: sessionId=', sessionId);
    const sid = await this.createSession(sessionId);
    console.log('[getToken] createSession 결과:', sid);
    const token = await this.createToken(sid);
    console.log('[getToken] createToken 결과:', token);

    // URL에서 토큰만 추출
    try {
      const url = new URL(token);
      const tokenParam = url.searchParams.get('token');
      if (!tokenParam) {
        throw new Error('토큰 파라미터가 없습니다');
      }
      // OpenVidu가 기대하는 형식으로 WebSocket URL 구성
      const wsUrl = `wss://www.talktalkcare.com:4443/openvidu?sessionId=${sid}&token=${tokenParam}`;
      console.log('[getToken] 구성된 WebSocket URL:', wsUrl);
      return wsUrl;
    } catch (err) {
      console.warn('[getToken] URL 파싱 실패, 원본 토큰으로 URL 구성:', token);
      return `wss://www.talktalkcare.com:4443/openvidu?sessionId=${sid}&token=${token}`;
    }
  }

  // 추가 public 메서드
  public async subscribeToStream(stream: any): Promise<Subscriber | undefined> {
    if (!this.session) return undefined;
    return await this.session.subscribe(stream, undefined);
  }
}

export default new OpenviduService();
