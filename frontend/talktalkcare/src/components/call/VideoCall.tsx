import React, { useEffect, useState, useRef, useCallback } from 'react';
import { OpenVidu, Session, Publisher, Subscriber, StreamManager } from 'openvidu-browser';
import { useNavigate } from 'react-router-dom';
import WsGameListPage from '../../pages/GamePages/ws/WsGameListPage';
import '../../styles/components/VideoCall.css';

// RemoteStream 컴포넌트: 각 구독자의 비디오 요소 렌더링
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
    // 기본 STUN 서버 및 암호화 설정 적용 (TURN 서버 설정 필요 시 추가)
    ov.setAdvancedConfiguration({
      iceServers: [
        {
          urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
        },
      ],
      publisherSrtcpCipher: 'AEAD_AES_128_GCM',
      subscriberSrtcpCipher: 'AEAD_AES_128_GCM',
    });
    return ov;
  });
  const [session, setSession] = useState<Session | null>(null);
  const [publisher, setPublisher] = useState<Publisher | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const sessionId = localStorage.getItem('currentSessionId');

  const navigateHome = useCallback(() => {
    localStorage.removeItem('currentSessionId');
    localStorage.removeItem('opponentUserId');
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    if (!sessionId) {
      navigateHome();
      return;
    }

    const initSession = async () => {
      try {
        const newSession = OV.initSession();

        // 이벤트 핸들러 등록
        const handleStreamCreated = async (event: any) => {
          try {
            // 연결 안정화를 위해 1초 딜레이
            await new Promise(resolve => setTimeout(resolve, 1000));
            const subscriber = await newSession.subscribe(event.stream, undefined);
            console.log('스트림 구독 성공:', event.stream.streamId);
            setSubscribers(prev => [...prev, subscriber]);
          } catch (error) {
            console.error('스트림 구독 실패:', error);
          }
        };

        const handleStreamDestroyed = (event: any) => {
          setSubscribers(prev =>
            prev.filter(sub => sub.stream?.streamId !== event.stream.streamId)
          );
        };

        const handleSessionDisconnected = () => {
          cleanupSession();
        };

        newSession.on('streamCreated', handleStreamCreated);
        newSession.on('streamDestroyed', handleStreamDestroyed);
        newSession.on('sessionDisconnected', handleSessionDisconnected);

        setSession(newSession);

        // 토큰 발급 및 세션 연결
        const token = await getToken(sessionId);
        await newSession.connect(token);
        console.log('세션 연결 완료');

        await new Promise(resolve => setTimeout(resolve, 1000));

        // 퍼블리셔 초기화 및 발행
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
        await newSession.publish(newPublisher);
        setPublisher(newPublisher);
      } catch (error) {
        console.error('세션 초기화 실패:', error);
        cleanupSession();
        navigateHome();
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

    return () => {
      cleanupSession();
    };
  }, [OV, sessionId, navigateHome]);

  const handleToggleCamera = useCallback(async () => {
    if (publisher) {
      const newState = !isVideoEnabled;
      await publisher.publishVideo(newState);
      setIsVideoEnabled(newState);
    }
  }, [publisher, isVideoEnabled]);

  const handleLeaveSession = () => {
    if (session) {
      try {
        session.disconnect();
      } catch (error) {
        console.error('세션 종료 중 에러:', error);
      }
      navigateHome();
    }
  };

  const handleStartScreenShare = async () => {
    if (!session) return;
    try {
      const OVInstance = session.openvidu;
      const screenPublisher = await OVInstance.initPublisherAsync(undefined, {
        videoSource: 'screen',
        publishAudio: false,
        publishVideo: true,
        mirror: false,
      });
      await session.publish(screenPublisher);
      console.log('화면 공유 시작!');
    } catch (error) {
      console.error('화면 공유 에러:', error);
    }
  };

  // API 함수들: createSession, createToken, getToken
  const createSession = async (sessId: string): Promise<string> => {
    const response = await fetch('https://www.talktalkcare.com/openvidu/api/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa('OPENVIDUAPP:talktalkcare'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customSessionId: sessId }),
      credentials: 'include',
    });
    if (response.status === 409) return sessId;
    if (!response.ok) {
      throw new Error(`세션 생성 실패: ${response.status}`);
    }
    const data = await response.json();
    return data.id;
  };

  const createToken = async (sessId: string): Promise<string> => {
    const response = await fetch(`https://www.talktalkcare.com/openvidu/api/sessions/${sessId}/connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('OPENVIDUAPP:talktalkcare'),
      },
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`토큰 생성 실패: ${response.status}`);
    }
    const data = await response.json();
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
