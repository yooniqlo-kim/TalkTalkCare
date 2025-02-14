import React, { useState, useEffect } from 'react';
import '../../styles/components/GameList.css';
import logicGames from './page/Logic/LogicalGame.ts';
import concentrationGames from './page/Concentration/Concentration.ts';
import thinkingGames from './page/Thinking/Thinking.ts';
import quicknessGames from './page/Quickness/Quickness.ts';
import memoryGames from './page/Memory/Memory.ts';

interface Game {
  id: string;
  name: string;
  description: string;
  component: React.FC;
  skill: string;
}

const GameListPage = () => {
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);

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

  return (
    <div className="game-list-container">
      <div className="game-header">
        <h1>치매 예방 게임 목록</h1>
      </div>

      <div className="game-content-wrapper">
        {/* 🔹 필터 버튼 */}
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

        {/* 🔹 게임 목록 */}
        <div className="games-list">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="game-card"
              onClick={() => setActiveGame(activeGame === game.id ? null : game.id)}
            >
              {/* 아이콘 + 게임 이름 */}
              <div className="game-icon-container">
                <div className="game-icon">{game.icon}</div>
                <div className="game-name">{game.name}</div> {/* ✅ 아이콘 아래 배치 */}
              </div>

              {/* 게임 설명 */}
              <div className="game-info">
                <p>{game.description}</p>
              </div>

              {/* 🔹 클릭된 게임의 경우만 컴포넌트 렌더링 */}
              {activeGame === game.id && (
                <div className="game-component">
                  <game.component />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameListPage;
