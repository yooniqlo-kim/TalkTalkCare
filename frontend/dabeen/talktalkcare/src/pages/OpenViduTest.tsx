import React, { useEffect, useRef, useState } from 'react';
import './OpenViduTest.css';

const OpenViduTest: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // WebSocket 연결
    wsRef.current = new WebSocket('ws://localhost:8080/signal');

    wsRef.current.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket 연결됨');
    };

    wsRef.current.onmessage = (event) => {
      console.log('메시지 수신:', event.data);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket 에러:', error);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendTestMessage = () => {
    if (wsRef.current && isConnected) {
      wsRef.current.send('테스트 메시지');
    }
  };

  return (
    <div className="openvidu-test-container">
      <h1>OpenVidu 테스트</h1>
      <div className="connection-status">
        연결 상태: {isConnected ? '연결됨' : '연결 안됨'}
      </div>
      <button 
        onClick={sendTestMessage}
        disabled={!isConnected}
      >
        테스트 메시지 전송
      </button>
    </div>
  );
};

export default OpenViduTest; 