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
  }, [selectedSkill]);

  // WebSocket 이벤트 리스너
  useEffect(() => {
    onGameSelected((event: GameEvent) => {
      const userId = localStorage.getItem('userId');
      
      if (event.senderId !== userId) {
        switch (event.type) {
          case 'GAME_SELECTED':
            const selectedGame = games.find((g) => g.id === event.gameId);
            setActiveGame(selectedGame || null);
            setIsHost(false);
            break;
          case 'GAME_DESELECTED':
            setActiveGame(null);
            setIsHost(false);
            break;
          case 'SKILL_CHANGED':
            if (event.skill) {
              setSelectedSkill(event.skill);
            }
            break;
        }
      }
    });
  }, [onGameSelected, games]);

  const handleGameClick = (game: Game) => {
    const userId = localStorage.getItem('userId');
    setActiveGame(game);
    setIsHost(true);
    
    sendGameEvent({
      type: 'GAME_SELECTED',
      gameId: game.id,
      senderId: userId
    });
  };

  const handleBackToList = () => {
    const userId = localStorage.getItem('userId');
    setActiveGame(null);
    setIsHost(false);
    
    sendGameEvent({
      type: 'GAME_DESELECTED',
      senderId: userId
    });
  };

  const handleSkillChange = (skill: string) => {
    const userId = localStorage.getItem('userId');
    setSelectedSkill(skill);
    
    sendGameEvent({
      type: 'SKILL_CHANGED',
      skill: skill,
      senderId: userId
    });
  };

  return (
    <div className="game-list-container">
      {activeGame ? (
        <div className="game-detail">
          {isHost && (
            <button className="back-button" onClick={handleBackToList}>
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
                onClick={() => handleSkillChange('all')}
              >
                전체
              </button>
              {skills.map((skill) => (
                <button
                  key={skill}
                  className={`skill-button ${selectedSkill === skill ? 'active' : ''}`}
                  onClick={() => handleSkillChange(skill)}
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