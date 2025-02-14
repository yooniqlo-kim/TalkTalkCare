import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Friend } from '../components/main_page/friends';

const WS_URL = import.meta.env.VITE_API_WS_URL;

interface WebSocketContextType {
  isConnected: boolean;
  setIsLoggedIn: (value: boolean) => void;
  onFriendStatusUpdate?: (friends: Friend[]) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const friendStatusCallbackRef = useRef<((friends: Friend[]) => void) | undefined>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;

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