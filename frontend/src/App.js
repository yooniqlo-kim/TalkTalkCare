import { useEffect, useState } from 'react';
import LoginForm from './components/LoginForm';
import FriendList from './components/FriendList/FriendList.tsx';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // 환경변수 확인을 위한 디버깅 코드
  useEffect(() => {
    console.log('API_BASE_URL:', API_BASE_URL);
  }, [API_BASE_URL]);

  useEffect(() => {
    // 자동 로그인 시도
    const autoLogin = async () => {
      if (!API_BASE_URL) {
        console.error('API_BASE_URL이 설정되지 않았습니다.');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/auto-login`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.result && data.result.msg === 'success') {
          setUser(data.body);
        }
      } catch (error) {
        console.error('자동 로그인 실패:', error);
        console.error('요청 URL:', `${API_BASE_URL}/api/users/auto-login`);
      }
    };

    if (API_BASE_URL) {
      autoLogin();
    }
  }, [API_BASE_URL]);

  const handleLogin = async (loginData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(loginData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.result && data.result.msg === 'success') {
        setUser(data.body);
      } else {
        alert(data.result?.msg || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 요청 실패:', error);
      alert('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <div className="App">
      {user ? (
        <div className="main-container">
          <header className="header">
            <div className="user-info">
              <h2>환영합니다, {user.username}님!</h2>
              {user.s3Filename && (
                <img 
                  src={`${user.s3Filename}`}
                  alt="프로필 이미지" 
                  className="profile-image"
                />
              )}
            </div>
          </header>
          <main className="content">
            <FriendList userId={user.userId} />
          </main>
        </div>
      ) : (
        <div className="login-container">
          <h1>Talk Talk Care</h1>
          <LoginForm onLogin={handleLogin} />
        </div>
      )}
    </div>
  );
}

export default App;
