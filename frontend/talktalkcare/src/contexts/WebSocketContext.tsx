import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';  // ✅ useNavigate 추가
import { Friend } from '../components/main_page/friends';
import CallNotificationModal from '../components/CallNotificationModal';
import CustomModal from '../../components/CustomModal';
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
  onFriendStatusUpdate?: (friends: Friend[]) => void;
  acceptCall: () => void;
  rejectCall: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();  // ✅ useNavigate() 추가
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
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

        websocket.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);

            // 화상통화 요청 처리
            if (data.message && data.message.includes("화상통화")) {
              setCallInvitation(data);
            }

            // 화상통화 수락시 처리
            if (data.message && data.message.includes("수락하였습니다")) {
              const acceptedData = data as CallInvitationDto;
              console.log('CALL_ACCEPTED 메시지 수신:', acceptedData);
              await openviduService.joinSession(acceptedData.openviduSessionId);
              localStorage.setItem('currentSessionId', acceptedData.openviduSessionId);
              navigate('/videocall');
            }

            // 화상통화 거절시 처리
            if (data.message && data.message.includes("거절하였습니다")) {
              const acceptedData = data as CallInvitationDto;
              
              localStorage.removeItem('currentSessionId');
              
              setModalMessage(`${acceptedData.receiverName}님께서 화상통화 요청을 거절하셨습니다.`);
              setIsModalOpen(true);
            }

            // 친구 상태 업데이트
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
  }, [isLoggedIn]);


  const handleAcceptCall = async () => {
    if (callInvitation) {
      console.log('📞 화상통화 수락 시작:', {
        sessionId: callInvitation.openviduSessionId,
        caller: callInvitation.callerId,
        receiver: callInvitation.receiverId
      });

      try {
        // OpenVidu 세션 참가
        const sessionResult = await openviduService.joinSession(callInvitation.openviduSessionId);
        console.log('✅ OpenVidu 세션 참가 완료:', sessionResult.session.sessionId);
        
        localStorage.setItem('currentSessionId', callInvitation.openviduSessionId);

        // 수락 메시지 전송
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

   // 거절 버튼 클릭 시, /call/reject 요청을 보내 caller에게 알림
   const handleRejectCall = async () => {
    if (callInvitation) {
      console.log('화상통화 거절:', callInvitation);
      try {
        await fetch(`${BASE_URL}/call/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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

  const contextValue = {
    isConnected,
    setIsLoggedIn,
    onFriendStatusUpdate: useCallback((callback?: (friends: Friend[]) => void) => {
      friendStatusCallbackRef.current = callback;
    }, []),
    acceptCall: handleAcceptCall,
    rejectCall: handleRejectCall,
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
