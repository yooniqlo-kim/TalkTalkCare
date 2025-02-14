import React from 'react';
import Router from './routes/Router';
import { WebSocketProvider } from './contexts/WebSocketContext';

function App() {
  return (
    <WebSocketProvider>
      <Router />
    </WebSocketProvider>
  );
}

export default App;