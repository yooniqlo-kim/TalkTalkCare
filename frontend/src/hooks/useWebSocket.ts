import { useEffect, useRef } from 'react';
import { Friend, FriendStatusUpdate } from '../types/friend';

type WebSocketMessage = Friend | FriendStatusUpdate;

export const useWebSocket = (
  url: string, 
  onMessage: (data: WebSocketMessage) => void
) => {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url, onMessage]);

  return ws.current;
};