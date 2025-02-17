import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Loader2 } from 'lucide-react';
import PentagonGraph from '../../components/my_page/graph/PentagonGraph';
import '../../styles/components/MyPage.css';
import ResultPage from '../DimentiaTest/Result.tsx'
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MyPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('game');
  const [activeTestTab, setActiveTestTab] = useState('user');

  const [userAiAnalysis, setUserAiAnalysis] = useState<string | null>(null);
  const [guardianAiAnalysis, setGuardianAiAnalysis] = useState<string | null>(null);
  
  // 로딩 상태 추가
  const [isUserAnalysisLoading, setIsUserAnalysisLoading] = useState(false);
  const [isGuardianAnalysisLoading, setIsGuardianAnalysisLoading] = useState(false);

  const userId = localStorage.getItem('userId');
  const isLoggedIn = Boolean(userId);

  const handleUserInfoClick = () => {
    navigate('/userinfopage');
  };

  // 예시 데이터
  const gameScores = {
    순발력: 80,
    논리력: 65,
    기억력: 90,
    사고력: 75,
    집중력: 85
  };

  // AI 분석 결과 요청 함수
  const fetchAiAnalyses = async () => {
    if (!userId) return;

    try {
      // 이용자용 AI 분석 요청
      setIsUserAnalysisLoading(true);
      const userResponse = await fetch(`${BASE_URL}/dementia-test/get-ai-result?userId=${userId}&testType=1`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!userResponse.ok) throw new Error('이용자 분석 데이터를 가져오지 못했습니다.');
      const userData = await userResponse.json();
      setUserAiAnalysis(userData.body); // 이용자용 결과 저장
      setIsUserAnalysisLoading(false);

      // 보호자용 AI 분석 요청
      setIsGuardianAnalysisLoading(true);
      const guardianResponse = await fetch(`${BASE_URL}/dementia-test/get-ai-result?userId=${userId}&testType=2`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!guardianResponse.ok) throw new Error('보호자 분석 데이터를 가져오지 못했습니다.');
      const guardianData = await guardianResponse.json();
      setGuardianAiAnalysis(guardianData.body); // 보호자용 결과 저장
      setIsGuardianAnalysisLoading(false);

    } catch (error) {
      console.error(error);
      setIsUserAnalysisLoading(false);
      setIsGuardianAnalysisLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      if (activeTab === 'test') {
        fetchAiAnalyses(); // 테스트 탭이 활성화되면 두 가지 분석 결과를 가져옴
      }
    }
  }, [isLoggedIn, activeTab]);

  return (
    <div className="my-page-container">
      <div className="profile-section">
        <div 
          className="profile-image-container" 
          onClick={handleUserInfoClick}
          style={{ cursor: 'pointer' }}
        >
          <div className="profile-image">
            <User size={64} />
          </div>
        </div>
        <h2 
          className="profile-title"
          onClick={handleUserInfoClick}
          style={{ cursor: 'pointer' }}
        >
          회원 정보
        </h2>
      </div>

      <div className="analysis-tabs">
        <button
          className={`tab-button ${activeTab === 'game' ? 'active' : ''}`}
          onClick={() => setActiveTab('game')}
        >
          게임 결과 분석
        </button>
        <button
          className={`tab-button ${activeTab === 'test' ? 'active' : ''}`}
          onClick={() => setActiveTab('test')}
        >
          치매 진단 테스트 결과 분석
        </button>
      </div>

      <div className="analysis-content" style={{backgroundColor: 'white'}}>
        {activeTab === 'game' && (
          <div className="game-analysis">
            <h3>게임 역량별 점수</h3>
            <div className="pentagon-graph-container">
              <PentagonGraph scores={gameScores} />
            </div>
          </div>
        )}

        {activeTab === 'test' && (
          <div className="test-analysis">
            <div className="test-tabs">
              <button
                className={`test-tab-button ${activeTestTab === 'user' ? 'active' : ''}`}
                onClick={() => setActiveTestTab('user')}
              >
                이용자
              </button>
              <button
                className={`test-tab-button ${activeTestTab === 'guardian' ? 'active' : ''}`}
                onClick={() => setActiveTestTab('guardian')}
              >
                보호자
              </button>
            </div>
            <div className="test-content">
              {activeTestTab === 'user' && (
                <div className="test-placeholder">
                  {isUserAnalysisLoading ? (
                    <div className="loading-container">
                      <Loader2 className="animate-spin" />
                      <p>잠시만 기다려주세요. 분석 결과를 불러오는 중입니다.</p>
                    </div>
                  ) : userAiAnalysis ? (
                    <p style={{ margin:'20px' }}>{userAiAnalysis}</p>
                  ) : null}
                </div>
              )}
              
              {activeTestTab === 'guardian' && (
                <div className="test-placeholder">
                  {isGuardianAnalysisLoading ? (
                    <div className="loading-container">
                      <Loader2 className="animate-spin" />
                      <p>잠시만 기다려주세요. 분석 결과를 불러오는 중입니다.</p>
                    </div>
                  ) : guardianAiAnalysis ? (
                    <p style={{ margin:'20px' }}>{guardianAiAnalysis}</p>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPage;