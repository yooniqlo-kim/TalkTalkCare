import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Friend } from '../components/main_page/friends';
import CallNotificationModal from '../components/CallNotificationModal';
import openviduService from '../services/openviduService';

const WS_URL = import.meta.env.VITE_API_WS_URL;
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  onFriendStatusUpdate: (callback: (friends: Friend[]) => void) => void;
  acceptCall: () => Promise<void>;
  rejectCall: () => Promise<void>;
  sendGameEvent: (data: any) => void;
  onGameSelected: (callback: (game: any) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const friendStatusCallbackRef = useRef<((friends: Friend[]) => void) | undefined>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;
  const gameSelectionCallback = useRef<(game: any) => void | undefined>();
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
        websocket.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            // 화상통화 요청 처리
            if (data.message && data.message.includes("화상통화")) {
              setCallInvitation(data);
            }
            // 화상통화 수락 시 처리
            if (data.message && data.message.includes("수락하였습니다")) {
              const acceptedData = data as CallInvitationDto;
              localStorage.setItem('opponentUserId', acceptedData.receiverId.toString());
              // caller도 OpenVidu 세션 참가
              await openviduService.joinSession(acceptedData.openviduSessionId);
              localStorage.setItem('currentSessionId', acceptedData.openviduSessionId);
              navigate('/videocall');
            }
            // 화상통화 거절 시 처리
            if (data.message && data.message.includes("거절하였습니다")) {
              const acceptedData = data as CallInvitationDto;
              localStorage.removeItem('currentSessionId');
              console.log(`${acceptedData.receiverName}님께서 화상통화 요청을 거절했습니다.`);
            }
            // 친구 상태 업데이트 (옵션)
            if (friendStatusCallbackRef.current && Array.isArray(data)) {
              friendStatusCallbackRef.current(data);
            }
            // 게임 선택 처리
            if (data.type === 'GAME_SELECTED' && gameSelectionCallback.current) {
              gameSelectionCallback.current(data);
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
  }, [isLoggedIn, navigate]);

  const handleAcceptCall = async () => {
    if (callInvitation) {
      console.log('📞 화상통화 수락 시작:', callInvitation);
      try {
        const sessionResult = await openviduService.joinSession(callInvitation.openviduSessionId);
        console.log('✅ OpenVidu 세션 참가 완료:', sessionResult.session.sessionId);
        localStorage.setItem('opponentUserId', callInvitation.callerId.toString());
        localStorage.setItem('currentSessionId', callInvitation.openviduSessionId);
        const response = await fetch(`${BASE_URL}/call/accept`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            receiverId: callInvitation.receiverId,
            callerId: callInvitation.callerId,
            openviduSessionId: callInvitation.openviduSessionId,
          }),
          credentials: 'include',
        });
        console.log('✅ 수락 메시지 전송 완료:', response.status);
        navigate('/videocall');
      } catch (error) {
        console.error('❌ 화상통화 수락 처리 실패:', error);
      }
      setCallInvitation(null);
    }
  };

  const handleRejectCall = async () => {
    if (callInvitation) {
      console.log('화상통화 거절:', callInvitation);
      try {
        await fetch(`${BASE_URL}/call/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            receiverName: callInvitation.receiverName,
            callerId: callInvitation.callerId,
            openviduSessionId: callInvitation.openviduSessionId,
          }),
          credentials: 'include',
        });
      } catch (error) {
        console.error('call/reject 요청 중 에러:', error);
      }
      setCallInvitation(null);
    }
  };

  const sendGameEvent = (data: any) => {
    if (ws && isConnected) {
      ws.send(JSON.stringify(data));
    }
  };

  const onGameSelected = useCallback((callback: (game: any) => void) => {
    gameSelectionCallback.current = callback;
  }, []);

  const contextValue: WebSocketContextType = {
    isConnected,
    setIsLoggedIn,
    onFriendStatusUpdate: useCallback((callback?: (friends: Friend[]) => void) => {
      friendStatusCallbackRef.current = callback;
    }, []),
    acceptCall: handleAcceptCall,
    rejectCall: handleRejectCall,
    sendGameEvent,
    onGameSelected,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
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
