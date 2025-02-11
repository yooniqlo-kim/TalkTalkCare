import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/components/Navbar.css';
// import { Logo } from 'lucide-react';  // 로고 아이콘 임포트 (예시)

const Navbar: React.FC = () => {
 return (
   <nav className="navbar">
     <div className="navbar-middle"
     style={{backgroundColor: '#F5FFEA'}}>
      <Link to="/" className="navbar-left">
        <img src="/images/logo.png" alt="로고" className="logo-image" />
        <p className="navbar-title ml-2">톡톡케어</p>
      </Link>
       <div className="navbar-menu">
        <Link to="/talktalk" className="text-blue-500 hover:text-blue-700 font-medium">톡톡</Link>
        <Link to="/sign-up" className="navbar-link">회원가입</Link>
        <Link to="/login" className="navbar-link">로그인</Link>
        <Link to="/test" className="navbar-link">진단 테스트</Link>
        <Link to="/mypage" className="navbar-link">내 정보</Link>.
       </div>
     </div>
   </nav>
 );
};

export default Navbar;