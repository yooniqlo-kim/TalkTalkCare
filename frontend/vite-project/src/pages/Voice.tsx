// import React, { useState, useEffect, useRef } from 'react';
// import "../styles/components/Voice.css";
// import axios from 'axios';
// import talktalk from "../assets/talktalk.png";
// import talkbubble from "../assets/talkbubble.png"

// interface RobotImageProps {
//   isListening: boolean;
//   isWaiting: boolean;
// }


// const RobotImage: React.FC<RobotImageProps> = ({ isListening, isWaiting }) => {
//   return (
//     <div className="robot-image-container">
//       <img 
//         src={talktalk}
//         alt="AI 로봇" 
//         className={`robot-image ${isListening ? 'listening' : ''}`}
//       />
      
//       {isWaiting && (
//         <div className="speech-bubble-container">
//           <img 
//             src={talkbubble} 
//             alt="말풍선" 
//             className="speech-bubble-image"
//           />
//           <div className="speech-bubble-text">전송 중입니다...</div>
//         </div>
//       )}
//     </div>
//   );
// };
// const SpeechToText = () => {
//  const [userId, setUserId] = useState<number>(() => {
//    const storedUserId = localStorage.getItem('userId');
//    return storedUserId ? parseInt(storedUserId) : 7;
//  });

//  const [isListening, setIsListening] = useState(false);
//  const [transcript, setTranscript] = useState('');
//  const [savedTranscripts, setSavedTranscripts] = useState<Array<{text: string, isUser: boolean}>>([]);
//  const [isLoading, setIsLoading] = useState(false);
//  const [isWaiting, setIsWaiting] = useState(false);
 
//  const recognitionRef = useRef<any>(null);
//  const tempTranscriptRef = useRef<string>('');
//  const transcriptsEndRef = useRef<HTMLDivElement>(null);

//  // 스크롤을 맨 아래로 이동하는 함수
//  const scrollToBottom = () => {
//    transcriptsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//  };

//  // 새 메시지 추가 시 스크롤 이동
//  useEffect(() => {
//    scrollToBottom();
//  }, [savedTranscripts]);

//  useEffect(() => {
//    localStorage.setItem('userId', userId.toString());
//  }, [userId]);

//  const startChat = async () => {
//    try {
//      const response = await axios.post(`http://localhost:8443/api/talktalk/start`, null, {
//        params: {
//          userId: userId
//        }
//      });
     
//      if (response.data) {
//        console.log('대화 시작');
//      }
//    } catch (error) {
//      console.error('대화 시작 에러:', error);
//    }
//  };

//  const sendTranscriptToServer = async (text: string) => {
//    try {
//      setIsLoading(true);
//      setIsWaiting(true);
//      stopListening();
 
//      // 사용자 메시지 먼저 추가
//      setSavedTranscripts(prev => [
//        ...prev,
//        { text, isUser: true }
//      ]);
 
//      console.log('전송할 데이터:', { response: text, userId });
 
//      const response = await axios.get(`http://localhost:8443/api/talktalk/chat`, {
//        params: { response: text, userId },
//        timeout: 100000
//      });
 
//      if (response.data && response.data.body) {
//        console.log('AI 응답:', response.data.body);
//        setSavedTranscripts(prev => [
//          ...prev,
//          { text: response.data.body, isUser: false }
//        ]);
//      }
 
//    } catch (error) {
//      console.error('전송 중 에러:', error);
//    } finally {
//      setIsLoading(false);
//      setIsWaiting(false);
//      startListening();
//    }
//  };

//  const endChat = async () => {
//    try {
//      const response = await axios.post(`http://localhost:8443/api/talktalk/end`, null, {
//        params: {
//          userId: userId
//        }
//      });
     
//      if (response.data) {
//        console.log('대화 종료 및 저장 완료');
//      }
//    } catch (error) {
//      console.error('대화 종료 에러:', error);
//    }
//  };

//  useEffect(() => {
//    if ('webkitSpeechRecognition' in window) {
//      recognitionRef.current = new (window as any).webkitSpeechRecognition();
//      recognitionRef.current.continuous = true;
//      recognitionRef.current.interimResults = true;
//      recognitionRef.current.lang = 'ko-KR';

//      recognitionRef.current.onresult = (event: any) => {
//        const current = event.resultIndex;
//        const transcriptText = event.results[current][0].transcript;
       
//        if (event.results[current].isFinal) {
//          sendTranscriptToServer(transcriptText);
//        } else {
//          tempTranscriptRef.current = transcriptText;
//          setTranscript(transcriptText);
//        }
//      };

//      recognitionRef.current.onerror = (event: any) => {
//        console.error('음성 인식 에러:', event.error);
//        setIsListening(false);
//      };

//      recognitionRef.current.onend = () => {
//        setIsListening(false);
//        tempTranscriptRef.current = '';
//        setTranscript('');
//      };

//      startListening();
//    }

//    return () => {
//      if (recognitionRef.current) {
//        recognitionRef.current.stop();
//      }
//    };
//  }, []);

//  const startListening = async () => {
//    if (!recognitionRef.current || isLoading || isListening) return;
 
//    try {
//      await startChat();
//      recognitionRef.current.start();
//      setIsListening(true);
//      tempTranscriptRef.current = '';
//      setTranscript('');
//    } catch (error) {
//      console.error('시작 에러:', error);
//    }
//  };

//  const stopListening = async () => {
//    if (recognitionRef.current) {
//      recognitionRef.current.stop();
//      setIsListening(false);
//      tempTranscriptRef.current = '';
//      setTranscript('');
//    }
//  };

//  const clearTranscripts = () => {
//    setSavedTranscripts([]);
//    tempTranscriptRef.current = '';
//    setTranscript('');
//  };

//  return (
//   <div className="overall-chat-container">
//     <div className="chat-header-container">
//       {/* 헤더 내용 */}
//       <h1>똑똑이와의 즐거운 대화~~!</h1>
//     </div>
 
//     <div className="chat-main-content">
//       <div className="speech-to-text-section">
//         {/* 로봇 이미지 섹션 */}
//         <div className="speech-recognition-container">
//           <RobotImage isListening={isListening} isWaiting={isWaiting} />
//         </div>
//       </div>
 
//       <div className="chat-content-section">
//         <div className="saved-transcripts">
//           <div className="transcripts-list">
//             {savedTranscripts.map((message, index) => (
//               <p 
//                 key={index} 
//                 className={`transcript-item ${message.isUser ? 'user-message' : 'ai-message'}`}
//               >
//                 {message.text}
//               </p>
//             ))}
//             <div ref={transcriptsEndRef} />
//           </div>
//         </div>
        
//         <div className="controls">
//           <button 
//             onClick={stopListening} 
//             className="control-button"
//             disabled={isLoading}
//           >
//             마이크 끄기
//           </button>
//           <button 
//             onClick={clearTranscripts} 
//             className="clear-button"
//             disabled={isLoading}
//           >
//             기록 지우기
//           </button>
//         </div>
//       </div>
//     </div>
//   </div>
//  );
// };

// export default SpeechToText;

import React, { useState, useEffect, useRef } from 'react';
import "../styles/components/Voice.css";
import axios from 'axios';
import talktalk from "../assets/talktalk.png";
import talkbubble from "../assets/talkbubble.png"

interface RobotImageProps {
  isListening: boolean;
  isWaiting: boolean;
}

const RobotImage: React.FC<RobotImageProps> = ({ isListening, isWaiting }) => {
  return (
    <div className="robot-image-container">
      <img 
        src={talktalk}
        alt="AI 로봇" 
        className={`robot-image ${isListening ? 'listening' : ''}`}
      />
      
      {isWaiting && (
        <div className="speech-bubble-container">
          <img 
            src={talkbubble} 
            alt="말풍선" 
            className="speech-bubble-image"
          />
          <div className="speech-bubble-text">전송 중입니다...</div>
        </div>
      )}
    </div>
  );
};

const SpeechToText = () => {
  const [userId, setUserId] = useState<number>(() => {
    const storedUserId = localStorage.getItem('userId');
    return storedUserId ? parseInt(storedUserId) : 7;
  });

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [savedTranscripts, setSavedTranscripts] = useState<Array<{text: string, isUser: boolean}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const tempTranscriptRef = useRef<string>('');
  const transcriptsEndRef = useRef<HTMLDivElement>(null);

  // 스크롤을 맨 아래로 이동하는 함수
  const scrollToBottom = () => {
    transcriptsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 새 메시지 추가 시 스크롤 이동
  useEffect(() => {
    scrollToBottom();
  }, [savedTranscripts]);

  useEffect(() => {
    localStorage.setItem('userId', userId.toString());
  }, [userId]);

  const startChat = async () => {
    try {
      const response = await axios.post(`http://localhost:8443/api/talktalk/start`, null, {
        params: {
          userId: userId
        }
      });
      
      if (response.data) {
        console.log('대화 시작');
      }
    } catch (error) {
      console.error('대화 시작 에러:', error);
    }
  };

  const sendTranscriptToServer = async (text: string) => {
    try {
      setIsLoading(true);
      setIsWaiting(true);
      stopListening();
  
      // 사용자 메시지 먼저 추가
      setSavedTranscripts(prev => [
        ...prev,
        { text, isUser: true }
      ]);
  
      console.log('전송할 데이터:', { response: text, userId });
  
      const response = await axios.get(`http://localhost:8443/api/talktalk/chat`, {
        params: { response: text, userId },
        timeout: 100000
      });
  
      if (response.data && response.data.body) {
        console.log('AI 응답:', response.data.body);
        setSavedTranscripts(prev => [
          ...prev,
          { text: response.data.body, isUser: false }
        ]);

        // AI 응답을 로컬 저장소에 저장
        localStorage.setItem('aiResponse', response.data.body);

        // AI 응답을 음성으로 변환
        convertTextToSpeech(response.data.body);
      }
  
    } catch (error) {
      console.error('전송 중 에러:', error);
    } finally {
      setIsLoading(false);
      setIsWaiting(false);
      startListening();
    }
  };

  const endChat = async () => {
    try {
      const response = await axios.post(`http://localhost:8443/api/talktalk/end`, null, {
        params: {
          userId: userId
        }
      });
      
      if (response.data) {
        console.log('대화 종료 및 저장 완료');
      }
    } catch (error) {
      console.error('대화 종료 에러:', error);
    }
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ko-KR';

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        
        if (event.results[current].isFinal) {
          sendTranscriptToServer(transcriptText);
        } else {
          tempTranscriptRef.current = transcriptText;
          setTranscript(transcriptText);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('음성 인식 에러:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        tempTranscriptRef.current = '';
        setTranscript('');
      };

      startListening();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = async () => {
    if (!recognitionRef.current || isLoading || isListening) return;
  
    try {
      await startChat();
      recognitionRef.current.start();
      setIsListening(true);
      tempTranscriptRef.current = '';
      setTranscript('');
    } catch (error) {
      console.error('시작 에러:', error);
    }
  };

  const stopListening = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      tempTranscriptRef.current = '';
      setTranscript('');
    }
  };

  const clearTranscripts = () => {
    setSavedTranscripts([]);
    tempTranscriptRef.current = '';
    setTranscript('');
  };

  // 네이버 클로바 VOICE API를 사용하여 음성 변환
  const getNaverToken = async () => {
    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_NAVER_CLIENT_SECRET;

    try {
        const response = await axios.post('https://api.ncloud-auth.com/oauth2.0/token', 
            `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        return response.data.access_token;
    } catch (error: any) {
        console.error('네이버 토큰 발급 에러:', error);
        // 네트워크 오류 처리
        if (error.code === 'ERR_NETWORK') {
            alert('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.');
        } else {
            alert('네이버 토큰 발급 중 오류가 발생했습니다.');
        }
        return null;
    }
};

const convertTextToSpeech = async (text: string) => {
  // 음성 합성을 지원하는지 확인
  if ('speechSynthesis' in window) {
    // 기존에 재생 중인 음성 중지
    window.speechSynthesis.cancel();

    // 새 음성 객체 생성
    const utterance = new SpeechSynthesisUtterance(text);
    
    // 한국어 음성 설정
    utterance.lang = 'ko-KR';
    
    // 음성 속성 조절 (선택사항)
    utterance.rate = 1.0; // 말하기 속도 (0.1 ~ 10)
    utterance.pitch = 1.0; // 음높이 (0 ~ 2)
    utterance.volume = 1.0; // 볼륨 (0 ~ 1)

    return new Promise<void>((resolve, reject) => {
      // 재생 완료 시 resolve
      utterance.onend = () => {
        console.log('음성 재생 완료');
        resolve();
      };
      
      // 오류 발생 시 reject
      utterance.onerror = (error) => {
        console.error('음성 재생 오류:', error);
        reject(error);
      };

      // 음성 재생
      window.speechSynthesis.speak(utterance);
    });
  } else {
    // 음성 합성을 지원하지 않는 브라우저
    console.warn('이 브라우저는 음성 합성을 지원하지 않습니다.');
    return Promise.reject(new Error('음성 합성 미지원'));
  }
};

  return (
    <div className="overall-chat-container">
      <div className="chat-header-container">
        {/* 헤더 내용 */}
        <h1>똑똑이와의 즐거운 대화~~!</h1>
      </div>
 
      <div className="chat-main-content">
        <div className="speech-to-text-section">
          {/* 로봇 이미지 섹션 */}
          <div className="speech-recognition-container">
            <RobotImage isListening={isListening} isWaiting={isWaiting} />
          </div>
        </div>
 
        <div className="chat-content-section">
          <div className="saved-transcripts">
            <div className="transcripts-list">
              {savedTranscripts.map((message, index) => (
                <p 
                  key={index} 
                  className={`transcript-item ${message.isUser ? 'user-message' : 'ai-message'}`}
                >
                  {message.text}
                </p>
              ))}
              <div ref={transcriptsEndRef} />
            </div>
          </div>
          
          <div className="controls">
            <button 
              onClick={stopListening} 
              className="control-button"
              disabled={isLoading}
            >
              마이크 끄기
            </button>
            <button 
              onClick={clearTranscripts} 
              className="clear-button"
              disabled={isLoading}
            >
              기록 지우기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechToText;

