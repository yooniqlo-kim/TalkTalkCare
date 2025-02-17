import React, { useEffect, useState, useRef, useCallback } from 'react';
import { OpenVidu, Session, Publisher, Subscriber } from 'openvidu-browser';
import { useNavigate } from 'react-router-dom';
import WsGameListPage from '../../pages/GamePages/ws/WsGameListPage';
import '../../styles/components/VideoCall.css';

// RemoteStream 컴포넌트 분리
const RemoteStream: React.FC<{ subscriber: Subscriber }> = ({ subscriber }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
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
    return ov;
  });

  const [session, setSession] = useState<Session | null>(null);
  const [publisher, setPublisher] = useState<Publisher | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const sessionId = localStorage.getItem('currentSessionId');

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
      return;
    }

    const initSession = async () => {
      try {
        // 1. 세션 초기화
        const newSession = OV.initSession();
        setSession(newSession);

        // 2. 이벤트 핸들러 등록
        const streamCreatedHandler = async (event: any) => {
          const subscriber = await newSession.subscribe(event.stream, undefined);
          setSubscribers(prev => [...prev, subscriber]);
        };

        const streamDestroyedHandler = (event: any) => {
          setSubscribers(prev => 
            prev.filter(sub => sub.stream.streamId !== event.stream.streamId)
          );
        };

        const sessionDisconnectedHandler = () => {
          cleanupSession();
        };

        newSession.on('streamCreated', streamCreatedHandler);
        newSession.on('streamDestroyed', streamDestroyedHandler);
        newSession.on('sessionDisconnected', sessionDisconnectedHandler);

        // 3. 토큰 발급 및 세션 연결
        const token = await getToken(sessionId);
        await newSession.connect(token);

        // 4. Publisher 초기화 및 발행
        const newPublisher = await OV.initPublisherAsync(undefined, {
          audioSource: undefined,
          videoSource: undefined,
          publishAudio: true,
          publishVideo: true,
          resolution: '640x480',
          frameRate: 30,
          insertMode: 'APPEND',
          mirror: false
        });

        await newSession.publish(newPublisher);
        setPublisher(newPublisher);

        // 5. Cleanup 함수 반환
        return () => {
          newSession.off('streamCreated', streamCreatedHandler);
          newSession.off('streamDestroyed', streamDestroyedHandler);
          newSession.off('sessionDisconnected', sessionDisconnectedHandler);
          cleanupSession();
        };

      } catch (error) {
        console.error('세션 초기화 실패:', error);
        cleanupSession();
        navigate('/');
      }
    };

    const cleanupSession = () => {
      if (session) {
        session.disconnect();
        setSession(null);
        setPublisher(null);
        setSubscribers([]);
        localStorage.removeItem('currentSessionId');
        localStorage.removeItem('opponentUserId');
      }
    };

    initSession();
  }, [OV, sessionId, navigate]);

  const handleToggleCamera = useCallback(async () => {
    if (publisher) {
      const newState = !isVideoEnabled;
      await publisher.publishVideo(newState);
      setIsVideoEnabled(newState);
    }
  }, [isVideoEnabled, publisher]);

  const handleLeaveSession = () => {
    if (session) {
      try {
        session.disconnect();
      } catch (error) {
        console.error('세션 종료 중 에러:', error);
      }
      localStorage.removeItem('currentSessionId');
      localStorage.removeItem('opponentUserId');
      navigate('/');
    }
  };

  // (A) 화면 공유 예시: 브라우저 탭 or 앱 전체 공유
  const handleStartScreenShare = async () => {
    if (!session) return;

    try {
      const OV = session.openvidu;
      const screenPublisher = await OV.initPublisherAsync(undefined, {
        videoSource: 'screen', // 화면 공유
        publishAudio: false,   // 필요하다면 true
        publishVideo: true,
        mirror: false
      });
      await session.publish(screenPublisher);
      console.log('화면 공유 시작!');
    } catch (error) {
      console.error('화면 공유 에러:', error);
    }
  };

  // OpenVidu 토큰 발급 관련 함수들 추가
  const createSession = async (sessionId: string): Promise<string> => {
    const response = await fetch('https://www.talktalkcare.com/openvidu/api/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa('OPENVIDUAPP:talktalkcare'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customSessionId: sessionId }),
      credentials: 'include'
    });

    if (response.status === 409) {
      return sessionId;
    }

    if (!response.ok) {
      throw new Error(`세션 생성 실패: ${response.status}`);
    }

    const data = await response.json();
    return data.id;
  };

  const createToken = async (sessionId: string): Promise<string> => {
    const response = await fetch(`https://www.talktalkcare.com/openvidu/api/sessions/${sessionId}/connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('OPENVIDUAPP:talktalkcare')
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`토큰 생성 실패: ${response.status}`);
    }

    const data = await response.json();
    return data.token;
  };

  const getToken = async (sessionId: string): Promise<string> => {
    const sid = await createSession(sessionId);
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
          {/* 화면 공유 버튼 예시 */}
          <button onClick={handleStartScreenShare}>화면 공유</button>
          <button onClick={handleLeaveSession}>세션 나가기</button>
        </div>
      </header>

      <div className="videocall-content">
        {/* 왼쪽: 위(내화면), 아래(상대방화면) */}
        <div className="video-section">
          <div className="video-row local">
            {publisher && (
              <video
                autoPlay
                playsInline
                ref={(video) => {
                  if (video && publisher) {
                    publisher.addVideoElement(video);
                  }
                }}
              />
            )}
            <p>나</p>
          </div>

          {/* 원격 스트림 (상대방 화면) */}
          {subscribers.length > 0 ? (
            <RemoteStream subscriber={subscribers[0]} />
          ) : (
            <p style={{ color: '#fff' }}>상대방 대기중...</p>
          )}
        </div>

        {/* 오른쪽: 게임 리스트 */}
        <div className="game-section">
          <WsGameListPage />
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
