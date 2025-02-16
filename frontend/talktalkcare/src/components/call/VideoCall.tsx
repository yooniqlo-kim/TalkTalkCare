// src/components/call/VideoCall.tsx
import React, { useEffect, useState } from 'react';
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

  // localStorage에 저장된 sessionId 사용
  const sessionId = localStorage.getItem('currentSessionId') || 'default-session';

  useEffect(() => {
    const join = async () => {
      try {
        const { session: sess, publisher: pub } = await openviduService.joinSession(sessionId);
        setSession(sess);
        setPublisher(pub);
        setMainStreamManager(pub); // 기본 메인 스트림은 자신의 퍼블리셔

        // 내부 예외 처리: OpenVidu에서 발생하는 예외 로깅
        sess.on('exception', (error) => {
          console.error('OpenVidu exception:', error);
        });

        // 신규 스트림 subscribe (streamCreated)
        sess.on('streamCreated', (event) => {
          try {
            const subscriber = sess.subscribe(event.stream, undefined);
            console.log("✅ 신규 스트림 추가됨:", event.stream.streamId);
            setSubscribers((prev) => [...prev, subscriber]);
          } catch (err) {
            console.error("신규 스트림 구독 중 에러:", err);
          }
        });

        // 스트림 종료 시 subscriber 제거 (streamDestroyed)
        sess.on('streamDestroyed', (event) => {
          console.log("❌ 스트림 종료:", event.stream.streamId);
          setSubscribers((prev) =>
            prev.filter((sub) => sub.stream?.streamId !== event.stream.streamId)
          );
        });

        // 연결 종료 시 subscriber 제거 (connectionDestroyed)
        sess.on('connectionDestroyed', (event) => {
          try {
            const destroyedId = event.connection.connectionId;
            console.log("연결 종료됨:", destroyedId);
            setSubscribers((prev) =>
              prev.filter((sub) => sub.stream?.connection?.connectionId !== destroyedId)
            );
          } catch (err) {
            console.error("connectionDestroyed 처리 중 에러:", err);
          }
        });

        // 만약 정말 필요하다면 (race condition 방지를 위해)
        // setTimeout(() => {
        //   try {
        //     if (sess.remoteConnections) {
        //       Object.values(sess.remoteConnections).forEach((connection: any) => {
        //         if (
        //           connection.connectionId !== sess.connection.connectionId &&
        //           connection.stream
        //         ) {
        //           const alreadySubscribed = subscribers.some(
        //             (sub) => sub.stream?.connection?.connectionId === connection.connectionId
        //           );
        //           if (!alreadySubscribed) {
        //             const subscriber = sess.subscribe(connection.stream, undefined);
        //             console.log("✅ 기존 스트림 구독됨:", connection.stream.streamId);
        //             setSubscribers((prev) => [...prev, subscriber]);
        //           }
        //         }
        //       });
        //     }
        //   } catch (err) {
        //     console.error("기존 remoteConnections 구독 중 에러:", err);
        //   }
        // }, 500);
        
      } catch (error) {
        console.error('세션 접속 실패:', error);
        alert('세션 접속에 실패했습니다.');
        navigate('/');
      }
    };

    join();

    return () => {
      if (session) {
        try {
          session.disconnect();
        } catch (e) {
          console.error("세션 종료 중 에러:", e);
        }
      }
    };
  }, [sessionId, navigate]);

  const handleLeaveSession = () => {
    if (session) {
      try {
        session.disconnect();
      } catch (e) {
        console.error("세션 종료 중 에러:", e);
      }
      localStorage.removeItem('currentSessionId');
      navigate('/');
    }
  };

  const handleToggleCamera = async () => {
    if (publisher) {
      const newState = !isVideoEnabled;
      try {
        await publisher.publishVideo(newState);
        setIsVideoEnabled(newState);
      } catch (error) {
        console.error("카메라 토글 중 에러:", error);
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
