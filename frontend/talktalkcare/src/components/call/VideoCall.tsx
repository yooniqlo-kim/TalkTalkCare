import React, { useEffect, useState, useRef, useCallback } from 'react';
import { OpenVidu, Session, Publisher, Subscriber } from 'openvidu-browser';
import { useNavigate } from 'react-router-dom';
import WsGameListPage from '../../pages/GamePages/ws/WsGameListPage';
import '../../styles/components/VideoCall.css';

// RemoteStream 컴포넌트: 각 구독자의 비디오 요소 렌더링
const RemoteStream: React.FC<{ subscriber: Subscriber }> = ({ subscriber }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current) {
      console.log('[RemoteStream] 비디오 엘리먼트에 스트림 추가');
      subscriber.addVideoElement(videoRef.current);
    }
  }, [subscriber]);
  return (
    <div className="video-row remote">
      <video autoPlay playsInline ref={videoRef} />
      <p>상대방</p>
    </div>
  );
};

const VideoCall: React.FC = () => {
  const navigate = useNavigate();
  const [OV] = useState(() => {
    const ov = new OpenVidu();
    ov.enableProdMode();
    console.log('[OV] OpenVidu 인스턴스 생성');
    return ov;
  });
  const [session, setSession] = useState<Session | null>(null);
  const [publisher, setPublisher] = useState<Publisher | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const sessionId = localStorage.getItem('currentSessionId');
  console.log('[VideoCall] sessionId:', sessionId);

  const navigateHome = useCallback(() => {
    localStorage.removeItem('currentSessionId');
    localStorage.removeItem('opponentUserId');
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    if (!sessionId) {
      console.log('[useEffect] sessionId 없음, 홈으로 이동');
      navigateHome();
      return;
    }

    const initSession = async () => {
      try {
        console.log('[initSession] 세션 초기화 시작');
        const newSession = OV.initSession();
        console.log('[initSession] 새 세션 생성:', newSession);
        
        // 이벤트 핸들러 등록
        newSession.on('streamCreated', async (event: any) => {
          console.log('[initSession] streamCreated 이벤트 발생:', event);
          try {
            // 연결 안정화를 위해 1초 딜레이
            await new Promise(resolve => setTimeout(resolve, 1000));
            const subscriber = await newSession.subscribe(event.stream, undefined);
            console.log('[initSession] 스트림 구독 성공:', event.stream.streamId);
            setSubscribers(prev => [...prev, subscriber]);
          } catch (error) {
            console.error('[initSession] 스트림 구독 실패:', error);
          }
        });

        newSession.on('streamDestroyed', (event: any) => {
          console.log('[initSession] streamDestroyed 이벤트 발생:', event);
          setSubscribers(prev =>
            prev.filter(sub => sub.stream?.streamId !== event.stream.streamId)
          );
        });

        newSession.on('sessionDisconnected', () => {
          console.log('[initSession] sessionDisconnected 이벤트 발생');
          cleanupSession();
        });

        setSession(newSession);

        // 토큰 발급 및 세션 연결
        console.log('[initSession] 토큰 발급 시작');
        const token = await getToken(sessionId);
        console.log('[initSession] 발급받은 토큰:', token);

        console.log('[initSession] 세션 연결 시도');
        await newSession.connect(token);
        console.log('[initSession] 세션 연결 완료');

        // 연결 후 딜레이
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 퍼블리셔 초기화 및 발행
        console.log('[initSession] 퍼블리셔 초기화 시작');
        const newPublisher = await OV.initPublisherAsync(undefined, {
          audioSource: undefined,
          videoSource: undefined,
          publishAudio: true,
          publishVideo: true,
          resolution: '640x480',
          frameRate: 30,
          insertMode: 'APPEND',
          mirror: false,
        });
        console.log('[initSession] 퍼블리셔 초기화 완료:', newPublisher);
        
        console.log('[initSession] 퍼블리셔 세션에 게시 시작');
        await newSession.publish(newPublisher);
        console.log('[initSession] 퍼블리셔 게시 완료');
        setPublisher(newPublisher);
      } catch (error) {
        console.error('[initSession] 세션 초기화 실패:', error);
        cleanupSession();
        navigateHome();
      }
    };

    const cleanupSession = () => {
      console.log('[cleanupSession] 세션 정리 시작');
      if (session) {
        session.disconnect();
        setSession(null);
        setPublisher(null);
        setSubscribers([]);
        localStorage.removeItem('currentSessionId');
        localStorage.removeItem('opponentUserId');
        console.log('[cleanupSession] 세션 정리 완료');
      }
    };

    initSession();

    return () => {
      cleanupSession();
    };
  }, [OV, sessionId, navigateHome]);

  const handleToggleCamera = useCallback(async () => {
    if (publisher) {
      const newState = !isVideoEnabled;
      console.log('[handleToggleCamera] 카메라 상태 변경:', newState);
      await publisher.publishVideo(newState);
      setIsVideoEnabled(newState);
    }
  }, [publisher, isVideoEnabled]);

  const handleLeaveSession = () => {
    if (session) {
      console.log('[handleLeaveSession] 세션 나가기');
      try {
        session.disconnect();
      } catch (error) {
        console.error('[handleLeaveSession] 세션 종료 중 에러:', error);
      }
      navigateHome();
    }
  };

  const handleStartScreenShare = async () => {
    if (!session) return;
    console.log('[handleStartScreenShare] 화면 공유 시작 요청');
    try {
      const OVInstance = session.openvidu;
      const screenPublisher = await OVInstance.initPublisherAsync(undefined, {
        videoSource: 'screen',
        publishAudio: false,
        publishVideo: true,
        mirror: false,
      });
      console.log('[handleStartScreenShare] 화면 공유 퍼블리셔 초기화 완료:', screenPublisher);
      await session.publish(screenPublisher);
      console.log('[handleStartScreenShare] 화면 공유 퍼블리셔 게시 완료');
    } catch (error) {
      console.error('[handleStartScreenShare] 화면 공유 에러:', error);
    }
  };

  // API 함수들: createSession, createToken, getToken
  const createSession = async (sessId: string): Promise<string> => {
    console.log('[createSession] 세션 생성 요청:', sessId);
    const response = await fetch('https://www.talktalkcare.com/openvidu/api/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa('OPENVIDUAPP:talktalkcare'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customSessionId: sessId }),
      credentials: 'include',
    });
    console.log('[createSession] 응답 상태:', response.status);
    if (response.status === 409) {
      console.log('[createSession] 세션이 이미 존재함:', sessId);
      return sessId;
    }
    if (!response.ok) {
      throw new Error(`[createSession] 세션 생성 실패: ${response.status}`);
    }
    const data = await response.json();
    console.log('[createSession] 세션 생성 성공:', data.id);
    return data.id;
  };

  const createToken = async (sessId: string): Promise<string> => {
    console.log('[createToken] 토큰 생성 요청 for session:', sessId);
    const response = await fetch(`https://www.talktalkcare.com/openvidu/api/sessions/${sessId}/connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('OPENVIDUAPP:talktalkcare'),
      },
      credentials: 'include',
    });
    console.log('[createToken] 응답 상태:', response.status);
    if (!response.ok) {
      throw new Error(`[createToken] 토큰 생성 실패: ${response.status}`);
    }
    const data = await response.json();
    console.log('[createToken] 토큰 생성 성공:', data.token);
    return data.token;
  };

  const getToken = async (sessId: string): Promise<string> => {
    const sid = await createSession(sessId);
    return await createToken(sid);
  };

  return (
    <div className="videocall-container">
      <header className="videocall-header">
        <h1>화상 통화 중</h1>
        <div className="control-buttons">
          <button onClick={handleToggleCamera}>
            {isVideoEnabled ? '카메라 끄기' : '카메라 켜기'}
          </button>
          <button onClick={handleStartScreenShare}>화면 공유</button>
          <button onClick={handleLeaveSession}>세션 나가기</button>
        </div>
      </header>

      <div className="videocall-content">
        <div className="video-section">
          {/* 로컬 비디오 */}
          <div className="video-row local">
            {publisher && (
              <video
                autoPlay
                playsInline
                ref={(video) => {
                  if (video && publisher) {
                    console.log('[Local Video] 로컬 퍼블리셔에 비디오 엘리먼트 연결');
                    publisher.addVideoElement(video);
                  }
                }}
              />
            )}
            <p>나</p>
          </div>
          {/* 원격 비디오 */}
          <div className="video-row remote">
            {subscribers.length > 0 ? (
              <RemoteStream subscriber={subscribers[0]} />
            ) : (
              <p style={{ color: '#fff' }}>상대방 대기중...</p>
            )}
          </div>
        </div>

        <div className="game-section">
          <WsGameListPage />
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
