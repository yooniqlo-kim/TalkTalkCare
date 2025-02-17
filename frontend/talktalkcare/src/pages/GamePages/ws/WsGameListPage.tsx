import React, { useState, useEffect } from 'react';
import '../../../styles/components/WsGameList.css';
import { useWebSocket } from '../../../contexts/WebSocketContext';
import logicGames from '../page/Logic/LogicalGame';
import concentrationGames from '../page/Concentration/Concentration';
import thinkingGames from '../page/Thinking/Thinking';
import quicknessGames from '../page/Quickness/Quickness';
import memoryGames from '../page/Memory/Memory';

interface Game {
  id: string;
  name: string;
  description: string;
  component: React.FC;
  skill: string;
  icon: string;
}

interface GameEvent {
  type: 'GAME_SELECTED' | 'GAME_DESELECTED' | 'SKILL_CHANGED';
  gameId?: string;
  skill?: string;
  senderId?: string;
}

const WsGameListPage = () => {
  const { sendGameEvent, onGameSelected } = useWebSocket();
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [isHost, setIsHost] = useState<boolean>(false);

  // 모든 게임 리스트
  const games: Game[] = [
    ...logicGames.map((game) => ({ ...game, skill: '논리력' })),
    ...concentrationGames.map((game) => ({ ...game, skill: '집중력' })),
    ...thinkingGames.map((game) => ({ ...game, skill: '사고력' })),
    ...quicknessGames.map((game) => ({ ...game, skill: '순발력' })),
    ...memoryGames,
  ];

  const skills = ['사고력', '집중력', '기억력', '순발력', '논리력'];

  // 선택된 skill에 맞는 게임만 필터링
  useEffect(() => {
    const filtered = selectedSkill === 'all'
      ? games
      : games.filter((game) => game.skill.trim() === selectedSkill.trim());
    setFilteredGames(filtered);
  }, [selectedSkill, games]);

  // WebSocket 이벤트 리스너 등록
  useEffect(() => {
    const userId = localStorage.getItem('userId');

    const handleGameEvent = (event: GameEvent) => {
      console.log('🎮 게임 이벤트 수신:', event); // ✅ 수신 로그 확인

      if (event.senderId !== userId) {
        switch (event.type) {
          case 'GAME_SELECTED': {
            const selectedGame = games.find((g) => g.id === event.gameId);
            console.log('🎯 상대방이 선택한 게임:', selectedGame);

            if (selectedGame) {
              setActiveGame(selectedGame);
              setIsHost(false);
            }
            break;
          }
          case 'GAME_DESELECTED':
            console.log('❌ 상대방이 게임을 해제함');
            setActiveGame(null);
            setIsHost(false);
            break;
          case 'SKILL_CHANGED':
            if (event.skill) {
              console.log('🔄 상대방이 스킬 변경:', event.skill);
              setSelectedSkill(event.skill);
            }
            break;
        }
      }
    };

    // WebSocket 이벤트 리스너 등록
    onGameSelected(handleGameEvent);

    return () => {
      onGameSelected(() => {});
    };
  }, [games]); // ✅ games 의존성 추가

  const handleGameClick = (game: Game) => {
    const userId = localStorage.getItem('userId');
    setActiveGame(game);
    setIsHost(true);

    const gameEvent: GameEvent = {
      type: 'GAME_SELECTED',
      gameId: game.id,
      skill: game.skill,
      senderId: userId,
    };

    console.log('📤 WebSocket 이벤트 전송:', gameEvent); // ✅ 전송 로그 확인
    sendGameEvent(gameEvent);
  };

  return (
    <div className="game-list-container">
      {activeGame ? (
        <div className="game-detail">
          {isHost && (
            <button className="back-button" onClick={() => handleGameClick(activeGame)}>
              ⬅ 목록으로
            </button>
          )}
          <h2 className='middle-title'>{activeGame.name}</h2>
          <div className='small-title'>
            <p>{activeGame.icon}</p>
            <p>{activeGame.description}</p>
          </div>
          <div className="game-component">
            <activeGame.component />
          </div>
        </div>
      ) : (
        <>
          <div className="game-header">
            <h1>화상통화 중 게임하기</h1>
          </div>

          <div className="game-content-wrapper">
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
