import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/components/Navbar.css';
import signup_icon from '../../assets/Signup.png';
import login_icon from '../../assets/login.png';
import mypage_icon from '../../assets/mypage.png';
import logout_icon from '../../assets/logout.png';

interface NavbarProps {
  isLoggedIn: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth(); // isLoggedIn은 props로 받으므로 제거

  const handleLogout = () => {
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-middle" style={{ backgroundColor: '#F5FFEA' }}>
        <Link to="/" className="navbar-left">
          <img src="/images/logo.png" alt="로고" className="logo-image" />
          <p className="navbar-title ml-2 text-2xl">톡톡케어</p>
        </Link>

        <div className="navbar-menu">
          {isLoggedIn ? (
            <>
              <Link to="/mypage" className="navbar-link">
                <img src={mypage_icon} alt="내 정보" className="menu-icon" />
                <p className='text-md'>내 정보</p>
              </Link>
              <button onClick={handleLogout} className="navbar-link">
                <img src={logout_icon} alt="로그아웃" className="menu-icon" />
                <p className='text-md'>로그아웃</p>
              </button>
            </>
          ) : (
            <>
              <Link to="/sign-up" className="navbar-link">
                <img src={signup_icon} alt="회원가입" className="menu-icon" />
                <p className='text-md'>회원가입</p>
              </Link>
              <Link to="/login" className="navbar-link">
                <img src={login_icon} alt="로그인" className="menu-icon" />
                <p className='text-md'>로그인</p>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;