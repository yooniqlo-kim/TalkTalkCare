import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Session, Publisher, Subscriber, StreamManager } from 'openvidu-browser';
import openviduService from '../../services/openviduService';
import { useNavigate } from 'react-router-dom';
import GameListPage from '../../pages/GamePages/GameListPage'; // 실제 경로
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

  const sessionRef = useRef<Session | null>(null);
  const publisherRef = useRef<Publisher | null>(null);

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);

  const sessionId = localStorage.getItem('currentSessionId') || 'default-session';

  // 스트림 구독 함수 분리
  const subscribeToStream = useCallback(async (session: Session, stream: any) => {
    try {
      console.log('스트림 구독 시작:', stream.streamId);
      
      // 구독 전 지연
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const subscriber = await session.subscribe(stream, undefined);
      console.log('구독 성공:', stream.streamId);

      setSubscribers(prev => {
        // 중복 구독 방지
        if (prev.some(sub => sub.stream?.streamId === stream.streamId)) {
          return prev;
        }
        return [...prev, subscriber];
      });
    } catch (error) {
      console.error('구독 실패:', error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const joinSession = async () => {
      try {
        // 중복 연결 체크 개선
        if (sessionRef.current?.connection?.connectionId) {
          console.log('이미 연결된 세션 유지:', sessionRef.current.connection.connectionId);
          return;
        }

        const { session, publisher } = await openviduService.joinSession(sessionId);
        if (!mounted) return;

        sessionRef.current = session;
        publisherRef.current = publisher;

        // 스트림 생성 이벤트는 openviduService에서 처리하도록 변경
        session.on('streamCreated', async (event) => {
          const subscriber = await openviduService.subscribeToStream(event.stream);
          if (subscriber) {
            setSubscribers(prev => {
              if (prev.some(sub => sub.stream?.streamId === subscriber.stream?.streamId)) {
                return prev;
              }
              return [...prev, subscriber];
            });
          }
        });

      } catch (error) {
        console.error('세션 접속 실패:', error);
        if (mounted) {
          alert('세션 접속에 실패했습니다.');
          navigate('/');
        }
      }
    };

    joinSession();

    return () => {
      mounted = false;
      if (sessionRef.current) {
        openviduService.leaveSession();
      }
    };
  }, [sessionId, navigate]);

  const handleToggleCamera = useCallback(async () => {
    if (publisherRef.current) {
      const newState = !isVideoEnabled;
      await publisherRef.current.publishVideo(newState);
      setIsVideoEnabled(newState);
    }
  }, [isVideoEnabled]);

  const handleLeaveSession = () => {
    if (sessionRef.current) {
      try {
        sessionRef.current.disconnect();
      } catch (error) {
        console.error('세션 종료 중 에러:', error);
      }
      localStorage.removeItem('currentSessionId');
      localStorage.removeItem('opponentUserId')
      navigate('/');
    }
  };

  // (A) 화면 공유 예시: 브라우저 탭 or 앱 전체 공유
  const handleStartScreenShare = async () => {
    if (!sessionRef.current) return;

    try {
      const OV = sessionRef.current.openvidu;
      const screenPublisher = await OV.initPublisherAsync(undefined, {
        videoSource: 'screen', // 화면 공유
        publishAudio: false,   // 필요하다면 true
        publishVideo: true,
        mirror: false
      });
      await sessionRef.current.publish(screenPublisher);
      console.log('화면 공유 시작!');
    } catch (error) {
      console.error('화면 공유 에러:', error);
    }
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
            {publisherRef.current && (
              <video
                autoPlay
                playsInline
                ref={(video) => {
                  if (video && publisherRef.current) {
                    publisherRef.current.addVideoElement(video);
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
          <GameListPage />
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
