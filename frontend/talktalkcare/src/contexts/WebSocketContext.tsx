import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useWebSocket } from '../components/main_page/hooks/useWebSocket';

interface WebSocketContextType {
  isConnected: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // localStorage의 userId 존재 여부로 로그인 상태 체크
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setIsLoggedIn(!!userId);
  }, []);

  const handleStatusUpdate = useMemo(() => (updatedFriend: any) => {
    console.log('친구 상태 업데이트:', updatedFriend);
  }, []);

  // 로그인된 상태일 때만 웹소켓 연결
  const { isConnected } = useWebSocket(handleStatusUpdate, isLoggedIn);

  const contextValue = useMemo(() => ({
    isConnected,
    setIsLoggedIn
  }), [isConnected]);

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};