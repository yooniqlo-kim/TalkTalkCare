import React, { useState, useEffect } from 'react';
import { List, LogOut } from 'lucide-react'; // LogOut 아이콘 추가
import { useNavigate } from 'react-router-dom';
import MainMenu from '../components/main_page/MainMenu'
import FriendList from '../components/main_page/FriendList';
import '../styles/components/MainPage.css';
import CardNews from '../components/main_page/CardNews';
import { authService } from '../services/authService'; // authService import
import { useFriendList } from '../contexts/FriendListContext' // ✅ 추가
import LoadingModal from '../components/LoadingModal'; // 🔥 로딩 모달 추가


const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const wsUrl = import.meta.env.VITE_API_WS_URL;
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { isFriendListOpen, setIsFriendListOpen } = useFriendList(); // ✅ context 사용
  const [isLoading, setIsLoading] = useState(true); // ✅ 로딩 상태 추가

  useEffect(() => {
    // 5초 동안 로딩 상태 유지 후 로딩 완료 (데이터 불러오는 시뮬레이션)
    setTimeout(() => {
      setIsLoading(false);
    }, 5000);
  }, []);


  // 실제 API 요청시 걸리는 기간 동안 로딩 모달 띄우기
  // useEffect(() => {
  //   const fetchFriends = async () => {
  //     try {
  //       setIsLoading(true); // ✅ 로딩 시작
  //       const response = await fetch('https://api.example.com/friends');
  //       const data = await response.json();
  //       setIsFriendListOpen(data);
  //     } catch (error) {
  //       console.error('친구 목록 불러오기 실패:', error);
  //     } finally {
  //       setIsLoading(false); // ✅ 로딩 끝
  //     }
  //   };

  //   fetchFriends();
  // }, []);
    
  const handleLogout = async () => {
    try {
      await authService.logout();
      
      // 로컬 스토리지 및 세션 관련 데이터 제거
      localStorage.removeItem('userId');
      localStorage.removeItem('token'); // 토큰이 있다면
      localStorage.removeItem('username');
      // 로그인 페이지로 리다이렉트
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={`main-page-container ${isFriendListOpen ? 'friend-list-open' : ''}`}>
      <div className="main-page-content">
        {/* 친구 목록 토글 버튼 */}
        {!isFriendListOpen && (
          <div className="friend-list-toggle">
            <button onClick={() => setIsFriendListOpen(true)} aria-label="친구 목록 열기">
              <List size={28} />
            </button>
          </div>
        )}

        {/* 메뉴 카드 (일렬 정렬, 친구 목록 열릴 때 크기 조정) */}
        <div className={`menu-card ${isFriendListOpen ? 'compressed' : ''}`}>
          <MainMenu isFriendListOpen={isFriendListOpen} />
          <CardNews isFriendListOpen={isFriendListOpen} />
        </div>
      </div>

      {/* 친구 목록 (isFriendListOpen 상태 활용) */}
      {isFriendListOpen && (
        <div className="friend-list-container">

          {/* 🔥 로딩 중이면 모달 표시 */}
          {isLoading && <LoadingModal />}

          <FriendList
            userId={parseInt(userId)}
            onClose={() => setIsFriendListOpen(false)}
            wsUrl={wsUrl}
            apiUrl={apiUrl}
          />
        </div>
      )}

    </div>
  );
};

export default MainPage;