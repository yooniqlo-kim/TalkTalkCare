import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import '../../styles/components/Login.css';
import axios, { AxiosError } from 'axios';
import { useWebSocketContext } from '../../contexts/WebSocketContext';

const Login = () => {
  const navigate = useNavigate();
  const { isConnected, setIsLoggedIn } = useWebSocketContext();
  const [formData, setFormData] = useState({
    userLoginId: '',
    password: '',
    autoLogin: false
  });
  const [autoLogin, setAutoLogin] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authService.login(formData);
      console.log('전체 응답:', response);
      
      if (response.result.msg === 'success') {
        // 로컬 스토리지에 사용자 정보 저장
        localStorage.setItem('userId', response.body.userId);
        localStorage.setItem('token', response.body.userId);
        localStorage.setItem('name', response.body.username);
        localStorage.setItem('profile-image', response.body.s3Filename);
        
        // 로그인 상태 업데이트하여 웹소켓 연결 트리거
        setIsLoggedIn(true);
        
        // 로그인 성공 메시지
        alert('로그인 성공!');
        
        // 메인 페이지로 이동
        navigate('/');
      } else {
        alert(response.result.msg || '로그인에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('로그인 에러:', error);
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        {/* 로그인 입력 폼 */}
        <form onSubmit={handleLogin}>
          {/* 아이디 입력 */}
          <div className="input-group">
            <input
              type="text"
              name="userLoginId"
              value={formData.userLoginId}
              onChange={handleChange}
              placeholder="아이디"
            />
          </div>

          {/* 비밀번호 입력 */}
          <div className="input-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호"
            />
          </div>

          {/* 자동 로그인 체크박스 */}
          <div className="auto-login">
            <label>
              <input
                type="checkbox"
                checked={autoLogin}
                onChange={(e) => setAutoLogin(e.target.checked)}
              />
              <span>자동 로그인</span>
            </label>
          </div>

          {/* 로그인 버튼 */}
          <button 
            type="submit" 
            className="login-button"
            disabled={!formData.userLoginId || !formData.password}
          >
            로그인
          </button> 
        </form>

        {/* 하단 링크들 */}
        <div className="bottom-links">
          <span onClick={() => navigate('/find-id')}>아이디 찾기</span>
          <span className="divider">|</span>
          <span onClick={() => navigate('/find-password')}>비밀번호 찾기</span>
          <span className="divider">|</span>
          <span onClick={() => navigate('/signup')}>회원가입</span>
        </div>
      </div>
    </div>
  );
};

export default Login;