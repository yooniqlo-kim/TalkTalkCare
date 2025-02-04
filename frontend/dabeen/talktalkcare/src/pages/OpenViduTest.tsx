import React, { useEffect, useState } from 'react';
import { OpenVidu, Session, Publisher, Subscriber } from 'openvidu-browser';
import './OpenViduTest.css';

const OPENVIDU_SERVER_URL = 'https://www.talktalkcare.com';  // HTTPS 사용
// const OPENVIDU_SERVER_SECRET = 'talktalkcare';
const DEFAULT_SESSION_ID = 'test-session';

const OpenViduTest: React.FC = () => {
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [publisher, setPublisher] = useState<Publisher | undefined>(undefined);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // WebSocket 관련 상태 추가
  const [wsMessages, setWsMessages] = useState<string[]>([]);

  // WebSocket 연결 설정
  useEffect(() => {
    const websocket = new WebSocket('wss://talktalkcare.com/ws/signal');

    websocket.onopen = () => {
      console.log('시그널링 서버 연결 성공');
    };

    websocket.onmessage = (event) => {
      console.log('시그널링 메시지 수신:', event.data);
      setWsMessages(prev => [...prev, event.data]);
    };

    websocket.onerror = (error) => {
      console.error('시그널링 서버 에러:', error);
    };

    websocket.onclose = () => {
      console.log('시그널링 서버 연결 종료');
    };

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, []);

  const createSession = async (sessionId: string) => {
    try {
      console.log('세션 생성 시도...');
      const response = await fetch(`${OPENVIDU_SERVER_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.status === 409) {
        console.log('세션이 이미 존재함:', sessionId);
        return sessionId;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('세션 생성 성공:', data);
      return data.id;
    } catch (error) {
      console.error('세션 생성 에러:', error);
      throw error;
    }
  };

  const createToken = async (sessionId: string) => {
    try {
      const response = await fetch(`${OPENVIDU_SERVER_URL}/api/sessions/${sessionId}/connections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('토큰 생성 성공:', data);
      return data.token;
    } catch (error) {
      console.error('토큰 생성 에러:', error);
      throw error;
    }
  };

  const joinSession = async () => {
    try {
      const OV = new OpenVidu();
      OV.enableProdMode();  // 프로덕션 모드 활성화 추가
      
      const session = OV.initSession();
      setSession(session);

      session.on('streamCreated', (event) => {
        console.log('스트림 생성됨');
        const subscriber = session.subscribe(event.stream, undefined);
        setSubscribers(prev => [...prev, subscriber]);
      });

      session.on('streamDestroyed', (event) => {
        console.log('스트림 제거됨');
        setSubscribers(prev => prev.filter(sub => sub !== event.stream.streamManager));
      });

      session.on('connectionCreated', () => {
        setIsConnected(true);
        console.log('OpenVidu 연결됨');
      });

      // 세션 생성 및 토큰 발급
      console.log('세션 생성 시도...');
      const createdSessionId = await createSession(DEFAULT_SESSION_ID);
      console.log('토큰 생성 시도...');
      const token = await createToken(createdSessionId);

      // 세션 연결
      console.log('세션 연결 시도...');
      await session.connect(token);
      console.log('세션 연결 성공');

      // 퍼블리셔 초기화
      console.log('퍼블리셔 초기화...');
      const publisher = await OV.initPublisher(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: true,
        publishVideo: true,
        resolution: '640x480',
        frameRate: 30,
        insertMode: 'APPEND',
      });

      // 스트림 발행
      console.log('스트림 발행 시도...');
      await session.publish(publisher);
      console.log('스트림 발행 성공');
      setPublisher(publisher);

    } catch (error) {
      console.error('세션 연결 에러:', error);
    }
  };

  const leaveSession = () => {
    if (session) {
      session.disconnect();
      setSession(undefined);
      setPublisher(undefined);
      setSubscribers([]);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    return () => {
      leaveSession();
    };
  }, []);

  return (
    <div className="openvidu-test-container">
      <h1>OpenVidu 1:1 화상통화 테스트</h1>
      <div className="connection-status">
        OpenVidu 연결 상태: {isConnected ? '연결됨' : '연결 안됨'}
      </div>
      <div className="button-container">
        {!session ? (
          <button onClick={joinSession}>세션 참여</button>
        ) : (
          <button onClick={leaveSession}>세션 나가기</button>
        )}
      </div>
      <div className="video-container">
        {publisher && (
          <div className="stream-container">
            <h3>내 비디오</h3>
            <video autoPlay ref={video => {
              if (video) {
                video.srcObject = publisher.stream.getMediaStream();
              }
            }} />
          </div>
        )}
        {subscribers.map((subscriber, i) => (
          <div key={i} className="stream-container">
            <h3>상대방 비디오</h3>
            <video autoPlay ref={video => {
              if (video) {
                video.srcObject = subscriber.stream.getMediaStream();
              }
            }} />
          </div>
        ))}
      </div>
      {/* WebSocket 메시지 표시 영역 추가 */}
      <div className="signaling-messages">
        <h3>시그널링 메시지</h3>
        {wsMessages.map((msg, index) => (
          <div key={index} className="message">{msg}</div>
        ))}
      </div>
    </div>
  );
};

export default OpenViduTest;
