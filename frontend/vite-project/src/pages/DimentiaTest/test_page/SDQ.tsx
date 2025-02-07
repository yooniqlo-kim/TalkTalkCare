import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/components/sdq.css';

// 문항 데이터 배열 정의
const questions = [
  "전화번호나 사람이름을 기억하기 힘들다.",
  "어떤 일이 언제 일어났는지 기억하지 못할 때가 있다.",
  "며칠 전에 들었던 이야기를 잊는다.",
  "오래 전부터 들었던 이야기를 잊는다.",
  "반복되는 일상 생활에 변화가 생겼을 때 금방 적응하기 힘들다.",
  "본인에게 중요한 사항을 잊을 때가 있다.(배우자 생일, 결혼기념일 등)",
  "다른 사람에게 같은 이야기를 반복할 때가 있다.",
  "어떤 일을 해 놓고도 잊어버려 다시 반복할 때가 있다.",
  "약속을 해 놓고 잊을 때가 있다.",
  "이야기 도중 방금 자기가 무슨 이야기를 하고 있었는지 잊을 때가 있다.",
  "약 먹는 시간을 놓치기도 한다.",
  "여러 가지 물건을 사러 갔다가 한두 가지를 빠뜨리기도 한다.",
  "가스 불을 끄는 것을 잊어버리거나 음식을 태운 적이 있다.",
  "남에게 같은 질문을 반복한다.",
  "어떤 일을 해 놓고도 했는지 안 했는지 몰라 다시 확인해야 한다.",
  "물건을 두고 다니거나 또는 가지고 갈 물건을 놓고 간다.",
  "하고 싶은 말이나 표현이 금방 떠오르지 않는다.",
  "물건 이름이 금방 생각나지 않는다.",
  "개인적인 편지나 사무적인 편지를 쓰기 힘들다.",
  "갈수록 말수가 감소되는 경향이 있다.",
  "신문이나 잡지를 읽을 때 이야기 줄거리를 파악하지 못한다.",
  "책을 읽을 때 같은 문장을 여러 번 읽어야 이해가 된다.",
  "텔레비전에 나오는 이야기를 따라가기 힘들다.",
  "자주 보는 친구나 친척을 바로 알아보지 못한다.",
  "물건을 어디에 두고 나중에 어디에 두었는지 몰라 찾게 된다.",
  "전에 가본 장소를 기억하지 못한다.",
  "방향감각이 떨어졌다.",
  "길을 잃거나 헤맨 적이 있다.",
  "물건을 항상 두는 장소를 잊어버리고 엉뚱한 곳을 찾는다.",
  "계산 능력이 떨어졌다.",
  "돈 관리를 하는 데 실수가 있다.",
  "과거에 쓰던 기구 사용이 서툴러졌다."
  // 보호자 문항들...
];

// API 서비스 분리
const submitSurvey = async (userId: number | null, testId: number, testResult: string) => {
  // 로그인한 사용자만 백엔드로 데이터 전송
  if (userId !== null) {
    const response = await fetch('/api/dementia-test/result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, testId, testResult }), // 요청 파라미터 포함
    });

    // 응답이 성공적이지 않으면 에러 발생
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // 응답 데이터를 JSON 형식으로 반환
    return response.json();
  } else {
    // 로그인하지 않은 사용자는 데이터를 전송하지 않음
    return Promise.resolve({ message: '로그인하지 않은 사용자입니다. 결과가 저장되지 않았습니다.' });
  }
};

const SDQ: React.FC = () => {
  const navigate = useNavigate();
  // 각 문항의 응답을 저장할 상태 (초기값은 null로 설정)
  const [answers, setAnswers] = useState<Array<string | null>>(new Array(questions.length).fill(null));

  // 로그인한 사용자의 ID (예시: 실제로는 로그인 시스템에서 가져옴)
  const [userId, setUserId] = useState<number | null>(null); // 로그인한 사용자라면 값이 있고, 아니면 null
  // 테스트 ID (0: 보호자용, 1: 자가진단용)
  const [testId, setTestId] = useState<number>(0); // 0 또는 1

  // 컴포넌트가 마운트될 때 세션 정보를 가져오기
    useEffect(() => {
      const fetchSession = async () => {
        try {
          const response = await fetch('/api/session'); // 세션 정보를 가져오는 API 호출
          if (response.ok) {
            const session = await response.json();
            setUserId(session.userId); // 세션에서 userId 추출하여 상태 업데이트
          } else {
            console.error('세션 정보를 가져오는 데 실패했습니다.');
          }
        } catch (error) {
          console.error('Error fetching session:', error);
        }
      };
  
      fetchSession();
    }, []); // 빈 배열을 전달하여 컴포넌트 마운트 시 한 번만 실행

  // 응답 처리 함수
  const handleAnswer = (index: number, answer: string) => {
    const newAnswers = [...answers];
    // 이미 선택된 답변을 다시 클릭한 경우 선택 해제
    if (answers[index] === answer) {
      newAnswers[index] = null;
    } else {
      // 새로운 답변 선택 또는 다른 답변으로 변경
      newAnswers[index] = answer;
    }
    setAnswers(newAnswers);
  };

  // 설문조사 제출 함수
  const handleSubmit = async () => {
    // 모든 문항이 답변되었는지 확인
    if (answers.includes(null)) {
      alert('모든 문항에 답변해 주세요.');
      return;
    }

    // testResult를 문자열 형식으로 변환 (예: "1: 1, 2: 0, 3: 1, ...")
    const testResult = answers
      .map((answer, index) => `${index + 1}: ${answer === '예' ? 1 : 0}`)
      .join(', ');

    // 콘솔에 데이터 출력 (백엔드로 전송될 데이터 확인)
    console.log('백엔드로 전송될 데이터:', {
      userId,
      testId,
      testResult,
    });

    try {
      // 백엔드로 데이터 전송 (로그인한 사용자만 전송)
      const result = await submitSurvey(userId, testId, testResult);
      console.log('Success:', result);

      // 결과 페이지로 이동 (필요한 경우 answers도 함께 전달)
      navigate('/result', { state: { answers } });
    } catch (error) {
      console.error('Error:', error);
      alert('설문조사 제출에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <div className="sdq-container">
      <div className="logo-section">
        <img src="/logo.png" alt="톡톡케어" className="logo" />
        <h1>톡톡케어</h1>
      </div>
      
      <div className="content-section">
        <h2>치매진단 테스트</h2>
        <div className="instruction">
          다음 문항을 읽고 최근 6개월 간의 해당 사항에<br />
          "예" 또는 "아니오"를 선택하시오
        </div>
        
        <div className="questions">
          {questions.map((question, index) => (
            <div key={index} className="question-item">
              <div className="question-text">
                {index + 1}. {question} {/* 문항 번호는 1부터 시작 */}
              </div>
              <div className="answer-buttons">
                <button 
                  className={`answer-btn ${answers[index] === '예' ? 'selected' : ''}`}
                  onClick={() => handleAnswer(index, '예')} // "예" 선택
                >
                  예
                </button>
                <button 
                  className={`answer-btn ${answers[index] === '아니오' ? 'selected' : ''}`}
                  onClick={() => handleAnswer(index, '아니오')} // "아니오" 선택
                >
                  아니오
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* 제출 버튼 추가 */}
        <div className="submit-section">
          <button 
            className="submit-button"
            onClick={handleSubmit} // 제출 버튼 클릭 시 handleSubmit 실행
          >
            제출하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SDQ;