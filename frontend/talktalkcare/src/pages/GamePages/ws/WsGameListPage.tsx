import React, { useState, useEffect } from 'react';
import '../../../styles/components/WsGameList.css';
import { useWebSocket } from '../../../contexts/WebSocketContext';

interface Game {
  id: string;
  name: string;
  description: string;
  component: React.FC;
  skill: string;
  icon: string;
}

const games: Game[] = [
  { id: "1", name: "기억력 게임", description: "기억력을 향상하는 게임", component: () => <></>, skill: "기억력", icon: "🧠" },
  { id: "2", name: "순발력 게임", description: "순발력을 테스트하는 게임", component: () => <></>, skill: "순발력", icon: "⚡" },
];

const WsGameListPage = () => {
  const { sendGameEvent, onGameSelected } = useWebSocket();
  const [activeGame, setActiveGame] = useState<Game | null>(null);

  useEffect(() => {
    onGameSelected((selectedGame) => {
      if (selectedGame.type === 'GAME_SELECTED') {
        setActiveGame(games.find((g) => g.id === selectedGame.gameId) || null);
      } else if (selectedGame.type === 'GAME_DESELECTED') {
        setActiveGame(null);
      }
    });
  }, []);

  const handleGameClick = (game: Game) => {
    setActiveGame(game);
    sendGameEvent({ type: 'GAME_SELECTED', gameId: game.id });
  };

  return (
    <div className="game-list-container">
      {activeGame ? (
        <div>
          <button onClick={() => sendGameEvent({ type: 'GAME_DESELECTED' })}>⬅ 목록으로</button>
          <h2>{activeGame.name}</h2>
        </div>
      ) : (
        <div>
          {games.map((game) => (
            <button key={game.id} onClick={() => handleGameClick(game)}>
              {game.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default WsGameListPage;
