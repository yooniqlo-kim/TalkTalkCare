import React, { useState, useEffect } from 'react';
import { List, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import MainMenu from '../components/main_page/MainMenu';
import Analytics from '../components/main_page/Analytics';
import FriendList from '../components/main_page/FriendList';
import '../styles/components/MainPage.css';

const MainPage: React.FC = () => {
  const [showFriendList, setShowFriendList] = useState(false);
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));
  const wsUrl = "ws://localhost:8080/ws";
  const apiUrl = "http://localhost:8080/api";

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedUsername = localStorage.getItem('username');

    if (storedUserId) {
      console.log('userId:', storedUserId);
      setUserId(storedUserId);
    } else {
      console.log('userId is not available.');
      navigate('/login');
    }

    if (storedUsername) {
      console.log('username:', storedUsername);
      setUsername(storedUsername);
    }
  }, [navigate]);
  
  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('userId');
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  if (!userId) {
    return null;
  }

  return (
    <div className="main-page-container">
      <div className="main-page-content">
        <div className="logout-button">
          <button 
            onClick={handleLogout} 
            aria-label="로그아웃"
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <LogOut size={24} />
          </button>
        </div>

        {!showFriendList && (
          <div className="friend-list-toggle">
            <button onClick={() => setShowFriendList(true)} aria-label="친구 목록 열기">
              <List size={28} />
            </button>
          </div>
        )}

        <div className="menu-card">
          <MainMenu />
          <Analytics />
        </div>
      </div>

      {showFriendList && (
        <div className="friend-list-container">
          <FriendList
            userId={parseInt(userId)}
            onClose={() => setShowFriendList(false)}
            wsUrl={wsUrl}
            apiUrl={apiUrl}
          />
        </div>
      )}
    </div>
  );
};

export default MainPage;