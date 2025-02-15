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
        setMainStreamManager(pub); // 초기 메인 스트림 설정
  
        // 📌 🔥 상대방 스트림 추가 수정
        sess.on('streamCreated', (event) => {
          const subscriber = sess.subscribe(event.stream, undefined);
          console.log("✅ 상대방 스트림 추가됨:", event.stream.streamId);
  
          setSubscribers((prev) => [...prev, subscriber]);
        });
  
        // 📌 🔥 상대방이 세션에서 나갔을 때 처리
        sess.on('streamDestroyed', (event) => {
          console.log("❌ 상대방 스트림 종료:", event.stream.streamId);
          setSubscribers((prev) =>
            prev.filter((sub) => sub.stream.streamId !== event.stream.streamId)
          );
        });
  
      } catch (error) {
        console.error('세션 접속 실패:', error);
        alert('세션 접속에 실패했습니다.');
        navigate('/'); // 실패 시 홈으로 이동
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
      session.disconnect();
      navigate('/'); // 세션 종료 후 홈으로 이동
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
