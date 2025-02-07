import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import '../../styles/components/Result.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log(import.meta.env.VITE_API_BASE_URL);

// 상태 타입 정의
interface LocationState {
    answers: string[];
}

const Result: React.FC = () => {
    const location = useLocation();
    const state = location.state as LocationState;
    const answers = state?.answers || [];
    
    // 로컬 스토리지에서 로그인된 사용자 정보 가져오기
    const userId = localStorage.getItem('userId');
    const isLoggedIn = Boolean(userId);
    
    // AI 분석 결과 상태
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

    // 결과 계산 함수
    const calculateResult = () => {
        return answers.filter(answer => answer === '예').length;
    };

    // AI 분석 결과 요청 함수
    const fetchAiAnalysis = async () => {
        if (!userId) return;

        try {
            const response = await fetch('${BASE_URL}/dementia-test/analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: Number(userId), requestType: 1 })
            });

            if (!response.ok) throw new Error('분석 데이터를 가져오지 못했습니다.');
            
            const data = await response.json();
            setAiAnalysis(data.analysisResult);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            fetchAiAnalysis();
        }
    }, [isLoggedIn]);

    return (
        <div className="result-container">
            <div className="logo-section">
                <img src="/logo.png" alt="톡톡케어" className="logo" />
                <h1>톡톡케어</h1>
            </div>
            
            <div className="content-section">
                <h2>치매진단<br />테스트 결과</h2>
                
                <div className="result-box">
                    <div className="result-content">
                        <p>총 {answers.length}문항 중 {calculateResult()}개의 항목에서 치매 위험이 감지되었습니다.</p>
                    </div>
                    <div className='result-notice'>
                        <p>자가 치매 진단을 위해 시행하는 SMCQ 테스트는 6개 이상 항목에서
                          치매 위험이 감지될 때, 주의가 필요하다고 판단합니다. 아래 버튼을
                          누르고 게임을 시작해 보세요!
                        </p>
                    </div>
                </div>
                
                {isLoggedIn && (
                    <button className="ai-analysis-button" onClick={fetchAiAnalysis}>
                        AI 분석 결과 보기
                    </button>
                )}
                
                {aiAnalysis && (
                    <div className="ai-analysis-result">
                        <h3>AI 분석 결과</h3>
                        <p>{aiAnalysis}</p>
                    </div>
                )}
                
                <Link to="/game" className="game-button">
                    게임 하러가기
                </Link>
            </div>
        </div>
    );
};

export default Result;
