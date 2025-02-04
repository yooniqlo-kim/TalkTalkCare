import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../pages/Header';
import '../../styles/components/Navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <Header className="navbar-header" />
      <ul className="navbar-list">
        <li><Link to="/" className="navbar-link">홈</Link></li>
        <li><Link to="/game" className="navbar-link">게임하기</Link></li>
        <li><Link to="/test" className="navbar-link">진단 테스트</Link></li>
        <li><Link to="/mypage" className="navbar-link">내 정보</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;