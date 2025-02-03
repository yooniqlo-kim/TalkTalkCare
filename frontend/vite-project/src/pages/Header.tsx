// src/components/Header.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  className?: string;  // className을 optional prop으로 정의
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const navigate = useNavigate();

  return (
    <header className={className}>
      <div className="header-content">
        <div className="logo" onClick={() => navigate('/')}>
          <img 
            src="/path-to-your-logo.png"  // 실제 로고 경로로 수정 필요
            alt="톡톡케어" 
            style={{ height: '40px',
              color:'white'
             }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;