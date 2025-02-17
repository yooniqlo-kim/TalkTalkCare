// WsGameListPage.tsx
import React, { useState, useEffect } from 'react';
import '../../styles/components/GameList.css';
import logicGames from '../page/Logic/LogicalGame';
import concentrationGames from '../page/Concentration/Concentration';
import thinkingGames from '../page/Thinking/Thinking';
import quicknessGames from '../page/Quickness/Quickness';
import memoryGames from '../page/Memory/Memory';
import { useWebSocket } from '../../../contexts/WebSocketContext';

export interface Game {
  id: string;
  name: string;
  description: string;
  component: React.FC;
  skill: string;
  icon: string;
}

const WsGameListPage: React.FC = () => {
  const { sendGameEvent, ws } = useWebSocket();
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);

  // 모든 게임 리스트 구성
  const games: Game[] = [
    ...logicGames.map((game) => ({ ...game, skill: '논리력' })),
    ...concentrationGames.map((game) => ({ ...game, skill: '집중력' })),
    ...thinkingGames.map((game) => ({ ...game, skill: '사고력' })),
    ...quicknessGames.map((game) => ({ ...game, skill: '순발력' })),
    ...memoryGames,
  ];

  const skills = ['사고력', '집중력', '기억력', '순발력', '논리력'];

  // 선택된 skill에 따라 게임 목록 필터링
  useEffect(() => {
    const filtered =
      selectedSkill === 'all'
        ? games
        : games.filter((game) => game.skill.trim() === selectedSkill.trim());
    setFilteredGames(filtered);
  }, [selectedSkill, games]);

  // 게임 선택 시 activeGame 업데이트 및 WebSocket 메시지 전송
  const handleGameClick = (game: Game) => {
    setActiveGame(game);
    console.log(`🕹️ 선택된 게임: ${game.id}`);
    // HTTP API 호출 대신 WebSocket 메시지만 전송합니다.
    sendGameEvent({
      type: 'GAME_SELECTED',
      game, // 필요한 게임 정보를 담아 전송 (예: id, name, description, icon 등)
    });
  };

  // WebSocket 메시지 수신: 상대방이 게임 선택 이벤트를 보냈을 때 처리
  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'GAME_SELECTED' && data.game) {
          console.log('상대방 게임 선택 이벤트 수신:', data.game);
          setActiveGame(data.game);
        }
      } catch (error) {
        console.error('게임 이벤트 처리 오류:', error);
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => {
      ws.removeEventListener('message', handleMessage);
    };
  }, [ws]);

  // 목록으로 돌아가기
  const handleBackToList = () => {
    console.log('🔄 목록으로 돌아가기');
    setActiveGame(null);
    // 선택 해제 이벤트를 원한다면 여기서도 WebSocket 메시지를 보낼 수 있습니다.
  };

  return (
    <div className="game-list-container">
      {activeGame ? (
        // 선택한 게임 화면
        <div className="game-detail">
          <button className="back-button" onClick={handleBackToList}>
            ⬅ 목록으로
          </button>
          <h2 className="middle-title">{activeGame.name}</h2>
          <div className="small-title">
            <p>{activeGame.icon}</p>
            <p>{activeGame.description}</p>
          </div>
          <div className="game-component">
            <activeGame.component />
          </div>
        </div>
      ) : (
        // 게임 목록 화면
        <>
          <div className="game-header">
            <h1>치매 예방 게임 목록</h1>
          </div>
          <div className="game-content-wrapper">
            {/* 필터 버튼 */}
            <div className="skills-filter">
              <button
                className={`skill-button ${selectedSkill === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedSkill('all')}
              >
                전체
              </button>
              {skills.map((skill) => (
                <button
                  key={skill}
                  className={`skill-button ${selectedSkill === skill ? 'active' : ''}`}
                  onClick={() => setSelectedSkill(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
            {/* 게임 목록 */}
            <div className="games-list">
              {filteredGames.map((game) => (
                <div
                  key={game.id}
                  className="game-card"
                  onClick={() => handleGameClick(game)}
                >
                  <div className="game-icon-container">
                    <div className="game-icon">{game.icon}</div>
                    <div className="game-name">{game.name}</div>
                  </div>
                  <div className="game-info">
                    <p>{game.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WsGameListPage;
