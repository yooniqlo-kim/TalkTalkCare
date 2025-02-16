// src/components/call/VideoCall.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Session, Publisher, Subscriber, StreamManager } from 'openvidu-browser';
import openviduService from '../../services/openviduService';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/VideoCall.css';

const VideoCall: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [publisher, setPublisher] = useState<Publisher | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [mainStreamManager, setMainStreamManager] = useState<StreamManager | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);

  // localStorage에 저장된 sessionId를 사용
  const sessionId = localStorage.getItem('currentSessionId') || 'default-session';

  useEffect(() => {
    const join = async () => {
      try {
        const { session: sess, publisher: pub } = await openviduService.joinSession(sessionId);
        setSession(sess);
        setPublisher(pub);
        setMainStreamManager(pub); // 자신의 퍼블리셔를 기본 메인 스트림으로 설정
        
        // 신규 스트림 이벤트 핸들러 등록 (이미 연결된 스트림이 없을 경우 대비)
        sess.on('streamCreated', (event) => {
          const subscriber = sess.subscribe(event.stream, undefined);
          console.log("✅ 신규 스트림 추가됨:", event.stream.streamId);
          setSubscribers((prev) => [...prev, subscriber]);
        });
  
        sess.on('streamDestroyed', (event) => {
          console.log("❌ 스트림 종료:", event.stream.streamId);
          setSubscribers((prev) =>
            prev.filter((sub) => sub.stream.streamId !== event.stream.streamId)
          );
        });
  
        // 세션 연결 후 잠시 지연을 두고 이미 존재하는 remoteConnections를 구독
        setTimeout(() => {
          if (sess.remoteConnections) {
            Object.values(sess.remoteConnections).forEach((connection: any) => {
              if (
                connection.connectionId !== sess.connection.connectionId &&
                connection.stream
              ) {
                // 중복 구독 방지를 위해 이미 구독한 스트림인지 체크하는 로직 추가도 고려
                const subscriber = sess.subscribe(connection.stream, undefined);
                console.log("✅ 기존 스트림 구독됨:", connection.stream.streamId);
                setSubscribers((prev) => [...prev, subscriber]);
              }
            });
          }
        }, 500); // 500ms 정도의 지연
        
      } catch (error) {
        console.error('세션 접속 실패:', error);
        alert('세션 접속에 실패했습니다.');
        navigate('/');
      }
    };
  
    join();
  
    return () => {
      if (session) {
        session.disconnect();
      }
    };
  }, [sessionId, navigate]);  
  

  const handleLeaveSession = () => {
    if (session) {
      // (선택 사항) WebSocket이나 다른 채널을 통해 상대방에게 종료 메시지 전송
      session.disconnect();
      localStorage.removeItem('currentSessionId'); // 세션 ID 삭제
      navigate('/'); // 홈 또는 원하는 화면으로 이동
    }
  };
  

  const handleToggleCamera = async () => {
    if (publisher) {
      const newState = !isVideoEnabled;
      await publisher.publishVideo(newState);
      setIsVideoEnabled(newState);
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
          {publisher && (
            <div
              className="thumbnail"
              onClick={() => setMainStreamManager(publisher)}
            >
              <video
                autoPlay
                playsInline
                ref={(video) => {
                  if (video) {
                    publisher.addVideoElement(video);
                  }
                }}
              />
              <p>나</p>
            </div>
          )}

          {/* 📌 🔥 상대방 비디오 추가 */}
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
