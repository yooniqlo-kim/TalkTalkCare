import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Friend } from '../components/main_page/friends';
import CallNotificationModal from '../components/CallNotificationModal';
import openviduService from '../services/openviduService';

const WS_URL = import.meta.env.VITE_API_WS_URL;

export interface CallInvitationDto {
  callerId: number;
  callerName: string;
  receiverId: number;
  receiverName: string;
  message: string;
  openviduSessionId: string;
}

interface WebSocketContextType {
  isConnected: boolean;
  setIsLoggedIn: (value: boolean) => void;
  onFriendStatusUpdate?: (friends: Friend[]) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate(); // useNavigate 훅 추가
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const friendStatusCallbackRef = useRef<((friends: Friend[]) => void) | undefined>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;

  const [callInvitation, setCallInvitation] = useState<CallInvitationDto | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setIsLoggedIn(!!userId);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const userId = localStorage.getItem('userId');
    if (!userId) return;

    

    const connectWebSocket = () => {
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.log('최대 재연결 시도 횟수 도달');
        return;
      }

      try {
        const websocket = new WebSocket(`${WS_URL}?userId=${userId}`);
        
        websocket.onopen = () => {
          console.log('✅ WebSocket 연결됨');
          setIsConnected(true);
          reconnectAttempts.current = 0;
        };

        websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // 화상통화 요청 처리
            if (data.message && data.message.includes("화상통화")) {
              setCallInvitation(data);
            }

            // 친구 상태 업데이트트
            if (friendStatusCallbackRef.current && Array.isArray(data)) {
              friendStatusCallbackRef.current(data);
            }
          } catch (error) {
            console.error('WebSocket 메시지 처리 오류:', error);
          }
        };

        websocket.onclose = (event) => {
          console.log('❌ WebSocket 연결 종료');
          setIsConnected(false);
          setWs(null);

          if (event.code !== 1000) {
            reconnectAttempts.current += 1;
            if (reconnectAttempts.current < maxReconnectAttempts) {
              console.log(`재연결 시도 ${reconnectAttempts.current}/${maxReconnectAttempts}`);
              setTimeout(connectWebSocket, 3000);
            }
          }
        };

        setWs(websocket);
      } catch (error) {
        console.error('웹소켓 연결 중 오류:', error);
        reconnectAttempts.current += 1;
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close(1000, "정상 종료");
      }
    };
  }, [isLoggedIn]); // friendStatusCallback 제거

  // 화상통화 요청 수락 시 동작 (필요한 로직 추가)
  // receiver가 호출 요청을 수락할 때: OpenVidu 세션에 접속한 후 videocall 페이지로 이동
  const handleAcceptCall = async () => {
    if (callInvitation) {
      console.log('화상통화 수락:', callInvitation);
      try {
        // receiver가 caller가 생성한 세션에 접속 (토큰이 내부에서 생성됨)
        await openviduService.joinSession(callInvitation.openviduSessionId);
        // sessionId를 localStorage에 저장 (VideoCall에서 사용)
        localStorage.setItem('currentSessionId', callInvitation.openviduSessionId);
        // 호출 수락 후 videocall 화면으로 이동
        navigate('/videocall');
      } catch (error) {
        console.error('Receiver 세션 접속 실패:', error);
      }
      setCallInvitation(null);
    }
  };

  // 화상통화 요청 거절 시 동작
  const handleRejectCall = () => {
    console.log('화상통화 거절:', callInvitation);
    // 예: 거절 메시지 전송 등
    setCallInvitation(null);
  };

  const contextValue = {
    isConnected,
    setIsLoggedIn,
    onFriendStatusUpdate: useCallback((callback?: (friends: Friend[]) => void) => {
      friendStatusCallbackRef.current = callback;
    }, [])
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
      {/* 화상통화 요청이 있을 경우 모달을 렌더링 */}
      {callInvitation && (
        <CallNotificationModal 
          title="화상통화 요청"
          message={`${callInvitation.callerName}님께서 ${callInvitation.receiverName}에게 화상통화 요청을 보냈습니다. 수락하시겠습니까?`}
          isOpen={true}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};