// src/components/call/VideoCall.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Session, Publisher, Subscriber, StreamManager } from 'openvidu-browser';
import openviduService from '../../services/openviduService';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/VideoCall.css';

const VideoCall: React.FC = () => {
  const navigate = useNavigate();

  // 클래스 컴포넌트처럼 session과 publisher를 재생성 없이 유지
  const sessionRef = useRef<Session | null>(null);
  const publisherRef = useRef<Publisher | null>(null);
  
  // 구독자 배열은 state로 관리
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  // 메인 비디오로 보여줄 StreamManager (초기엔 publisher)
  const [mainStreamManager, setMainStreamManager] = useState<StreamManager | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);

  // caller 또는 receiver가 사용하는 sessionId (localStorage에 저장된 값 사용)
  const sessionId = localStorage.getItem('currentSessionId') || 'default-session';

  useEffect(() => {
    let mounted = true;
    const joinSession = async () => {
      try {
        // 이전 세션이 있으면 leave 처리 (테스트 시에는 클래스 컴포넌트처럼 한 번만 생성)
        if (sessionRef.current) {
          sessionRef.current.disconnect();
        }

        // openviduService.joinSession은 내부적으로 세션 초기화, 토큰 발급, publisher 생성 후 publish를 수행함
        const { session, publisher } = await openviduService.joinSession(sessionId);
        if (!mounted) return;
        sessionRef.current = session;
        publisherRef.current = publisher;
        setMainStreamManager(publisher);

        // 신규 스트림 subscribe
        session.on('streamCreated', (event) => {
          try {
            const subscriber = session.subscribe(event.stream, undefined);
            console.log('✅ 신규 스트림 추가됨:', event.stream.streamId);
            setSubscribers((prev) => [...prev, subscriber]);
          } catch (error) {
            console.error('신규 스트림 구독 중 에러:', error);
          }
        });

        // 스트림 종료 시 해당 구독자 제거
        session.on('streamDestroyed', (event) => {
          console.log('❌ 스트림 종료:', event.stream.streamId);
          setSubscribers((prev) =>
            prev.filter((sub) => sub.stream?.streamId !== event.stream.streamId)
          );
        });

        // (필요시) connectionDestroyed 이벤트도 등록
        session.on('connectionDestroyed', (event) => {
          try {
            const destroyedId = event.connection.connectionId;
            console.log('연결 종료됨:', destroyedId);
            setSubscribers((prev) =>
              prev.filter((sub) => sub.stream?.connection?.connectionId !== destroyedId)
            );
          } catch (error) {
            console.error('connectionDestroyed 처리 중 에러:', error);
          }
        });

      } catch (error) {
        console.error('세션 접속 실패:', error);
        alert('세션 접속에 실패했습니다.');
        navigate('/');
      }
    };

    joinSession();

    // 언마운트 시 세션 disconnect (한 번만 실행)
    return () => {
      mounted = false;
      if (sessionRef.current) {
        try {
          sessionRef.current.disconnect();
        } catch (error) {
          console.error('세션 종료 중 에러:', error);
        }
      }
    };
  }, [sessionId, navigate]);

  const handleLeaveSession = () => {
    if (sessionRef.current) {
      try {
        sessionRef.current.disconnect();
      } catch (error) {
        console.error('세션 종료 중 에러:', error);
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
