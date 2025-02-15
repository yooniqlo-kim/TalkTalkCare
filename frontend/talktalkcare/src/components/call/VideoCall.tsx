// src/components/call/VideoCall.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Session, Publisher, Subscriber, StreamManager } from 'openvidu-browser';
import openviduService from '../../services/openviduService';
import { useNavigate } from 'react-router-dom';
import "/src/styles/components/VideoCall.css";

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
        // 만약 이미 openviduService.joinSession()으로 접속되어 있다면,
        // 세션 정보를 가져오는 방법(예: 서비스 내부에 저장된 session)을 활용할 수도 있습니다.
        // 여기서는 새로 접속하는 예시로 처리합니다.
        const { session: sess, publisher: pub } = await openviduService.joinSession(sessionId);
        setSession(sess);
        setPublisher(pub);
        setMainStreamManager(pub); // 초기 메인 스트림은 자신의 퍼블리셔

        // 상대방 스트림(구독자) 이벤트 처리
        sess.on('streamCreated', (event) => {
          const subscriber = sess.subscribe(event.stream, undefined);
          setSubscribers((prev) => [...prev, subscriber]);
        });
        sess.on('streamDestroyed', (event) => {
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
