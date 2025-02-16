// src/components/call/VideoCall.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Session, Publisher, Subscriber, StreamManager } from 'openvidu-browser';
import openviduService from '../../services/openviduService';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/VideoCall.css';

const VideoCall: React.FC = () => {
  const navigate = useNavigate();

  // session과 publisher는 useRef로 관리하여 재렌더링과 클린업 문제 방지
  const sessionRef = useRef<Session | null>(null);
  const publisherRef = useRef<Publisher | null>(null);

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [mainStreamManager, setMainStreamManager] = useState<StreamManager | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);

  // localStorage에 저장된 sessionId 사용 (caller 또는 receiver 모두 동일 sessionId 사용)
  const sessionId = localStorage.getItem('currentSessionId') || 'default-session';

  useEffect(() => {
    let isMounted = true; // 비동기 처리 중 언마운트 방지

    const join = async () => {
      try {
        const { session, publisher } = await openviduService.joinSession(sessionId);
        if (!isMounted) return;
        sessionRef.current = session;
        publisherRef.current = publisher;
        setMainStreamManager(publisher); // 기본 메인 스트림은 자신의 퍼블리셔

        // 내부 예외 처리: OpenVidu SDK 에러 로깅
        session.on('exception', (error) => {
          console.error('OpenVidu exception:', error);
        });

        // 신규 스트림이 생기면 subscribe (streamCreated)
        session.on('streamCreated', (event) => {
          try {
            const subscriber = session.subscribe(event.stream, undefined);
            console.log('✅ 신규 스트림 추가됨:', event.stream.streamId);
            setSubscribers((prev) => [...prev, subscriber]);
          } catch (err) {
            console.error('신규 스트림 구독 중 에러:', err);
          }
        });

        // 스트림 종료 시 해당 subscriber 제거 (streamDestroyed)
        session.on('streamDestroyed', (event) => {
          console.log('❌ 스트림 종료:', event.stream.streamId);
          setSubscribers((prev) =>
            prev.filter((sub) => sub.stream?.streamId !== event.stream.streamId)
          );
        });

        // 연결 종료(참가자 퇴장) 이벤트 처리 (connectionDestroyed)
        session.on('connectionDestroyed', (event) => {
          try {
            const destroyedId = event.connection.connectionId;
            console.log('연결 종료됨:', destroyedId);
            setSubscribers((prev) =>
              prev.filter((sub) => sub.stream?.connection?.connectionId !== destroyedId)
            );
          } catch (err) {
            console.error('connectionDestroyed 처리 중 에러:', err);
          }
        });
      } catch (error) {
        console.error('세션 접속 실패:', error);
        alert('세션 접속에 실패했습니다.');
        navigate('/');
      }
    };

    join();

    // 컴포넌트 언마운트 시 세션 disconnect (한번만 수행)
    return () => {
      isMounted = false;
      if (sessionRef.current) {
        try {
          sessionRef.current.disconnect();
        } catch (e) {
          console.error('세션 종료 중 에러:', e);
        }
      }
    };
  }, [sessionId, navigate]);

  const handleLeaveSession = () => {
    if (sessionRef.current) {
      try {
        sessionRef.current.disconnect();
      } catch (e) {
        console.error('세션 종료 중 에러:', e);
      }
      localStorage.removeItem('currentSessionId');
      navigate('/');
    }
  };

  const handleToggleCamera = async () => {
    if (publisherRef.current) {
      const newState = !isVideoEnabled;
      try {
        await publisherRef.current.publishVideo(newState);
        setIsVideoEnabled(newState);
      } catch (error) {
        console.error('카메라 토글 중 에러:', error);
      }
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
          <button onClick={handleLeaveSession}>세션 나가기</button>
        </div>
      </header>

      <main className="videocall-main">
        {/* 메인 비디오 영역 */}
        <div className="main-video">
          {mainStreamManager && (
            <video
              autoPlay
              playsInline
              ref={(video) => {
                if (video) {
                  mainStreamManager.addVideoElement(video);
                }
              }}
            />
          )}
        </div>

        {/* 썸네일 영역 */}
        <div className="thumbnails">
          {publisherRef.current && (
            <div
              className="thumbnail"
              onClick={() => setMainStreamManager(publisherRef.current!)}
            >
              <video
                autoPlay
                playsInline
                ref={(video) => {
                  if (video && publisherRef.current) {
                    publisherRef.current.addVideoElement(video);
                  }
                }}
              />
              <p>나</p>
            </div>
          )}

          {subscribers.map((sub, idx) => (
            <div
              key={idx}
              className="thumbnail"
              onClick={() => setMainStreamManager(sub)}
            >
              <video
                autoPlay
                playsInline
                ref={(video) => {
                  if (video) {
                    sub.addVideoElement(video);
                  }
                }}
              />
              <p>상대방 {idx + 1}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default VideoCall;
