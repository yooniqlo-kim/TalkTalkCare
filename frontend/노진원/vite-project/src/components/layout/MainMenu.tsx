import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, GamepadIcon, FileText, User } from 'lucide-react';
import Header from './Header';
import '../../styles/components/MenuItem.css';

interface MainMenuProps {
  showHorizontal?: boolean; // true일 경우 한 줄 레이아웃
}

const MainMenu: React.FC<MainMenuProps> = ({ showHorizontal = false }) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="menu">
      <Header />
      <div
        className={`menu-grid ${showHorizontal ? 'flex flex-row gap-6 justify-center' : 'grid grid-cols-2 gap-6'}`}
        style={{
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <div onClick={() => handleNavigation('/call')} className="menu-item">
          <div className="menu-item-icon">
            <Phone size={50} />
          </div>
          <p className="menu-item-text">통화하기</p>
        </div>

        <div onClick={() => handleNavigation('/game')} className="menu-item">
          <div className="menu-item-icon">
            <GamepadIcon size={50} />
          </div>
          <p className="menu-item-text">게임하기</p>
        </div>

        <div onClick={() => handleNavigation('/test')} className="menu-item">
          <div className="menu-item-icon">
            <FileText size={50} />
          </div>
          <p className="menu-item-text">치매 진단 테스트</p>
        </div>

        <div onClick={() => handleNavigation('/mypage')} className="menu-item">
          <div className="menu-item-icon">
            <User size={50} />
          </div>
          <p className="menu-item-text">마이페이지</p>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
