import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import '../../styles/components/Header.css';

const Header = () => (
  <div>
    <div className="header-container">
      <Link to="/" className="logo-container">
        <img src={logo} alt="톡톡케어 로고" className="logo-image" />
        <span className="logo-title">톡톡케어</span>
      </Link>
    </div>
  </div>
);

export default Header;
