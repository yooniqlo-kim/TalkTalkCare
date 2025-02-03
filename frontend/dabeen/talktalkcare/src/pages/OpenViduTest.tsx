import React, { useEffect, useState } from 'react';
import { OpenVidu, Session, Publisher, Subscriber } from 'openvidu-browser';
import './OpenViduTest.css';

const OPENVIDU_SERVER_URL = 'https://talktalkcare.com';
const OPENVIDU_SERVER_SECRET = 'talktalkcare';
const DEFAULT_SESSION_ID = 'test-session';  // 기본 세션 ID 상수로 정의

const OpenViduTest: React.FC = () => {
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [publisher, setPublisher] = useState<Publisher | undefined>(undefined);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const createSession = async (sessionId: string) => {
    const response = await fetch(`${OPENVIDU_SERVER_URL}/openvidu/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`OPENVIDUAPP:${OPENVIDU_SERVER_SECRET}`)
      },
      body: JSON.stringify({ customSessionId: sessionId })
    });

    if (response.status === 409) {
      return sessionId;
    }
    
    const data = await response.json();
    return data.id;
  };

  const createToken = async (sessionId: string) => {
    const response = await fetch(`${OPENVIDU_SERVER_URL}/openvidu/api/sessions/${sessionId}/connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`OPENVIDUAPP:${OPENVIDU_SERVER_SECRET}`)
      }
    });
    const data = await response.json();
    return data.token;
  };

  const joinSession = async () => {
    try {
      const OV = new OpenVidu();
      const session = OV.initSession();
      setSession(session);

      session.on('streamCreated', (event) => {
        const subscriber = session.subscribe(event.stream, undefined);
        setSubscribers(prev => [...prev, subscriber]);
      });

      session.on('streamDestroyed', (event) => {
        setSubscribers(prev => prev.filter(sub => sub !== event.stream.streamManager));
      });

      session.on('connectionCreated', () => {
        setIsConnected(true);
        console.log('OpenVidu 연결됨');
      });

      // 세션 생성 및 토큰 발급
      const createdSessionId = await createSession(DEFAULT_SESSION_ID);
      const token = await createToken(createdSessionId);

      // 세션 연결
      await session.connect(token);

      // 퍼블리셔 초기화
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
      await session.publish(publisher);
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
        연결 상태: {isConnected ? '연결됨' : '연결 안됨'}
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
            <video autoPlay={true} ref={video => {
              if (video) {
                video.srcObject = publisher.stream.getMediaStream();
              }
            }} />
          </div>
        )}
        {subscribers.map((subscriber, i) => (
          <div key={i} className="stream-container">
            <h3>상대방 비디오</h3>
            <video autoPlay={true} ref={video => {
              if (video) {
                video.srcObject = subscriber.stream.getMediaStream();
              }
            }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpenViduTest; 