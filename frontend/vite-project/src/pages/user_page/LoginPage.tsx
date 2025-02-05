import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/Login.css';
import Header from '../Header';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: '',
    password: '',
  });
  const [autoLogin, setAutoLogin] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 로그인 로직 구현
    console.log('로그인 시도:', formData, '자동로그인:', autoLogin);
  };

  return (
    <div className="login-container">
      <Header />
      <div className="login-form">
        {/* 로그인 입력 폼 */}
        <form onSubmit={handleLogin}>
          {/* 아이디 입력 */}
          <div className="input-group">
            <input
              type="text"
              name="id"
              value={formData.id}
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
            disabled={!formData.id || !formData.password}
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