// import React, { useState, useEffect, useRef } from 'react';
// import "../styles/components/Voice.css";
// import axios from 'axios';

// const BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const USER_ID = 7;  // 고정된 사용자 ID

// const SpeechToText = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [transcript, setTranscript] = useState('');
//   const [savedTranscripts, setSavedTranscripts] = useState<string[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
  
//   const recognitionRef = useRef<any>(null);
//   const tempTranscriptRef = useRef<string>('');

//   // 대화 시작
//   const startChat = async () => {
//     try {
//       const response = await axios.post('/api/talktalk/start', null, {
//         params: {
//           userId: USER_ID
//         }
//       });
      
//       if (response.data) {
//         console.log('대화 시작');
//       }
//     } catch (error) {
//       console.error('대화 시작 에러:', error);
//     }
//   };

//   // 텍스트 전송
//   const sendTranscriptToServer = async (text: string) => {
//     try {
//       setIsLoading(true);
//       console.log(text);
      
//       const response = await axios.get('/api/talktalk/chat', {
//         params: {
//           response: text,
//           userId: USER_ID
//         }
//       });

//       if (response.data && response.data.data) {
//         console.log('AI 응답:', response.data.data);
//       }
      
//     } catch (error) {
//       console.error('전송 중 에러:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // 대화 종료
//   const endChat = async () => {
//     try {
//       const response = await axios.post('/api/talktalk/end', null, {
//         params: {
//           userId: USER_ID
//         }
//       });
      
//       if (response.data) {
//         console.log('대화 종료 및 저장 완료');
//       }
//     } catch (error) {
//       console.error('대화 종료 에러:', error);
//     }
//   };

//   useEffect(() => {
//     if ('webkitSpeechRecognition' in window) {
//       recognitionRef.current = new (window as any).webkitSpeechRecognition();
//       recognitionRef.current.continuous = true;
//       recognitionRef.current.interimResults = true;
//       recognitionRef.current.lang = 'ko-KR';

//       recognitionRef.current.onresult = (event: any) => {
//         const current = event.resultIndex;
//         const transcriptText = event.results[current][0].transcript;
        
//         if (event.results[current].isFinal) {
//           setSavedTranscripts(prev => {
//             const newTranscripts = [...prev, transcriptText];
//             sendTranscriptToServer(transcriptText);
//             return newTranscripts;
//           });
          
//           tempTranscriptRef.current = '';
//           setTranscript('');
//         } else {
//           tempTranscriptRef.current = transcriptText;
//           setTranscript(transcriptText);
//         }
//       };

//       recognitionRef.current.onerror = (event: any) => {
//         console.error('음성 인식 에러:', event.error);
//         setIsListening(false);
//       };

//       recognitionRef.current.onend = () => {
//         setIsListening(false);
//         tempTranscriptRef.current = '';
//         setTranscript('');
//       };
//     }

//     return () => {
//       if (recognitionRef.current) {
//         recognitionRef.current.stop();
//       }
//     };
//   }, []);

//   const startListening = async () => {
//     if (recognitionRef.current) {
//       try {
//         await startChat();  // 대화 시작 API 호출
//         recognitionRef.current.start();
//         setIsListening(true);
//         tempTranscriptRef.current = '';
//         setTranscript('');
//       } catch (error) {
//         console.error('시작 에러:', error);
//         recognitionRef.current.stop();
//         setTimeout(() => {
//           recognitionRef.current.start();
//           setIsListening(true);
//         }, 100);
//       }
//     } else {
//       console.error('이 브라우저는 음성 인식을 지원하지 않습니다');
//     }
//   };

//   const stopListening = async () => {
//     if (recognitionRef.current) {
//       recognitionRef.current.stop();
//       setIsListening(false);
//       tempTranscriptRef.current = '';
//       setTranscript('');
//       await endChat();  // 대화 종료 API 호출
//     }
//   };

//   const clearTranscripts = () => {
//     setSavedTranscripts([]);
//     tempTranscriptRef.current = '';
//     setTranscript('');
//   };

//   return (
//     <div className="speech-to-text-container">
//       <div className="controls">
//         {!isListening ? (
//           <button 
//             onClick={startListening} 
//             className="control-button"
//             disabled={isLoading}
//           >
//             마이크 켜기
//           </button>
//         ) : (
//           <button 
//             onClick={stopListening} 
//             className="control-button"
//             disabled={isLoading}
//           >
//             마이크 끄기
//           </button>
//         )}
//         <button 
//           onClick={clearTranscripts} 
//           className="clear-button"
//           disabled={isLoading}
//         >
//           기록 지우기
//         </button>
//       </div>
      
//       <div className="transcript-box">
//         <h3>현재 입력 중인 텍스트:</h3>
//         <p>{transcript}</p>
//         {isLoading && <p className="loading-text">전송 중...</p>}
//       </div>

//       <div className="saved-transcripts">
//         <h3>저장된 문장 기록:</h3>
//         <div className="transcripts-list">
//           {savedTranscripts.map((text, index) => (
//             <p key={index} className="transcript-item">
//               {index + 1}. {text}
//             </p>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SpeechToText;
// import React, { useState, useEffect, useRef } from 'react';
// import "../styles/components/Voice.css";
// import axios from 'axios';

// const BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const USER_ID = 7;  // 고정된 사용자 ID

// const SpeechToText = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [transcript, setTranscript] = useState('');
//   const [savedTranscripts, setSavedTranscripts] = useState<string[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
  
//   const recognitionRef = useRef<any>(null);
//   const tempTranscriptRef = useRef<string>('');

//   // 대화 시작
//   const startChat = async () => {
//     try {
//       const response = await axios.post('/api/talktalk/start', null, {
//         params: {
//           userId: USER_ID
//         }
//       });
      
//       if (response.data) {
//         console.log('대화 시작');
//       }
//     } catch (error) {
//       console.error('대화 시작 에러:', error);
//     }
//   };

//   // 텍스트 전송
//   const sendTranscriptToServer = async (text: string) => {
//     try {
//       setIsLoading(true);
//       console.log('전송할 데이터:', {
//         response: text,
//         userId: USER_ID
//       });
      
//       const response = await axios.get('/api/talktalk/chat', {
//         params: {
//           response: text,
//           userId: USER_ID
//         }
//       });

//       console.log('서버 응답:', response);

//       if (response.data && response.data.data) {
//         console.log('AI 응답:', response.data.data);
//       }
      
//     } catch (error) {
//       console.error('전송 중 에러:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // 대화 종료
//   const endChat = async () => {
//     try {
//       const response = await axios.post('/api/talktalk/end', null, {
//         params: {
//           userId: USER_ID
//         }
//       });
      
//       if (response.data) {
//         console.log('대화 종료 및 저장 완료');
//       }
//     } catch (error) {
//       console.error('대화 종료 에러:', error);
//     }
//   };

//   useEffect(() => {
//     if ('webkitSpeechRecognition' in window) {
//       recognitionRef.current = new (window as any).webkitSpeechRecognition();
//       recognitionRef.current.continuous = true;
//       recognitionRef.current.interimResults = true;
//       recognitionRef.current.lang = 'ko-KR';

//       recognitionRef.current.onresult = (event: any) => {
//         const current = event.resultIndex;
//         const transcriptText = event.results[current][0].transcript;
        
//         if (event.results[current].isFinal) {
//           setSavedTranscripts(prev => {
//             const newTranscripts = [...prev, transcriptText];
//             sendTranscriptToServer(transcriptText);
//             return newTranscripts;
//           });
          
//           tempTranscriptRef.current = '';
//           setTranscript('');
//         } else {
//           tempTranscriptRef.current = transcriptText;
//           setTranscript(transcriptText);
//         }
//       };

//       recognitionRef.current.onerror = (event: any) => {
//         console.error('음성 인식 에러:', event.error);
//         setIsListening(false);
//       };

//       recognitionRef.current.onend = () => {
//         setIsListening(false);
//         tempTranscriptRef.current = '';
//         setTranscript('');
//       };
//     }

//     return () => {
//       if (recognitionRef.current) {
//         recognitionRef.current.stop();
//       }
//     };
//   }, []);

//   const startListening = async () => {
//     if (recognitionRef.current) {
//       try {
//         await startChat();  // 대화 시작 API 호출
//         recognitionRef.current.start();
//         setIsListening(true);
//         tempTranscriptRef.current = '';
//         setTranscript('');
//       } catch (error) {
//         console.error('시작 에러:', error);
//         recognitionRef.current.stop();
//         setTimeout(() => {
//           recognitionRef.current.start();
//           setIsListening(true);
//         }, 100);
//       }
//     } else {
//       console.error('이 브라우저는 음성 인식을 지원하지 않습니다');
//     }
//   };

//   const stopListening = async () => {
//     if (recognitionRef.current) {
//       recognitionRef.current.stop();
//       setIsListening(false);
//       tempTranscriptRef.current = '';
//       setTranscript('');
//       await endChat();  // 대화 종료 API 호출
//     }
//   };

//   const clearTranscripts = () => {
//     setSavedTranscripts([]);
//     tempTranscriptRef.current = '';
//     setTranscript('');
//   };

//   return (
//     <div className="speech-to-text-container">
//       <div className="controls">
//         {!isListening ? (
//           <button 
//             onClick={startListening} 
//             className="control-button"
//             disabled={isLoading}
//           >
//             마이크 켜기
//           </button>
//         ) : (
//           <button 
//             onClick={stopListening} 
//             className="control-button"
//             disabled={isLoading}
//           >
//             마이크 끄기
//           </button>
//         )}
//         <button 
//           onClick={clearTranscripts} 
//           className="clear-button"
//           disabled={isLoading}
//         >
//           기록 지우기
//         </button>
//       </div>
      
//       <div className="transcript-box">
//         <h3>현재 입력 중인 텍스트:</h3>
//         <p>{transcript}</p>
//         {isLoading && <p className="loading-text">전송 중...</p>}
//       </div>

//       <div className="saved-transcripts">
//         <h3>저장된 문장 기록:</h3>
//         <div className="transcripts-list">
//           {savedTranscripts.map((text, index) => (
//             <p key={index} className="transcript-item">
//               {index + 1}. {text}
//             </p>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SpeechToText;

import React, { useState, useEffect, useRef } from 'react';
import "../styles/components/Voice.css";
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SpeechToText = () => {
 // 로컬 스토리지에서 userId 가져오기, 없으면 기본값 7로 설정
 const [userId, setUserId] = useState<number>(() => {
   const storedUserId = localStorage.getItem('userId');
   return storedUserId ? parseInt(storedUserId) : 7;
 });

 const [isListening, setIsListening] = useState(false);
 const [transcript, setTranscript] = useState('');
 const [savedTranscripts, setSavedTranscripts] = useState<string[]>([]);
 const [isLoading, setIsLoading] = useState(false);
 
 const recognitionRef = useRef<any>(null);
 const tempTranscriptRef = useRef<string>('');

 // 컴포넌트 마운트 시 userId 체크 및 설정
 useEffect(() => {
   // 로컬 스토리지에 userId 저장
   localStorage.setItem('userId', userId.toString());
 }, [userId]);

 // 대화 시작
 const startChat = async () => {
   try {
     const response = await axios.post(`${BASE_URL}/talktalk/start`, null, {
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

 // 텍스트 전송
 const sendTranscriptToServer = async (text: string) => {
   try {
     setIsLoading(true);
     console.log('전송할 데이터:', {
       response: text,
       userId: userId
     });
     
     const response = await axios.get(`${BASE_URL}/talktalk/chat`, {
       params: {
         response: text,
         userId: userId
       }
     });

     console.log('서버 응답:', response);

     if (response.data && response.data.data) {
       console.log('AI 응답:', response.data.data);
     }
     
   } catch (error) {
     console.error('전송 중 에러:', error);
   } finally {
     setIsLoading(false);
   }
 };

 // 대화 종료
 const endChat = async () => {
   try {
     const response = await axios.post(`${BASE_URL}/talktalk/end`, null, {
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
         setSavedTranscripts(prev => {
           const newTranscripts = [...prev, transcriptText];
           sendTranscriptToServer(transcriptText);
           return newTranscripts;
         });
         
         tempTranscriptRef.current = '';
         setTranscript('');
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
   }

   return () => {
     if (recognitionRef.current) {
       recognitionRef.current.stop();
     }
   };
 }, []);

 const startListening = async () => {
   if (recognitionRef.current) {
     try {
       await startChat();  // 대화 시작 API 호출
       recognitionRef.current.start();
       setIsListening(true);
       tempTranscriptRef.current = '';
       setTranscript('');
     } catch (error) {
       console.error('시작 에러:', error);
       recognitionRef.current.stop();
       setTimeout(() => {
         recognitionRef.current.start();
         setIsListening(true);
       }, 100);
     }
   } else {
     console.error('이 브라우저는 음성 인식을 지원하지 않습니다');
   }
 };

 const stopListening = async () => {
   if (recognitionRef.current) {
     recognitionRef.current.stop();
     setIsListening(false);
     tempTranscriptRef.current = '';
     setTranscript('');
     await endChat();  // 대화 종료 API 호출
   }
 };

 const clearTranscripts = () => {
   setSavedTranscripts([]);
   tempTranscriptRef.current = '';
   setTranscript('');
 };

 return (
   <div className="speech-to-text-container">
     <div className="controls">
       {!isListening ? (
         <button 
           onClick={startListening} 
           className="control-button"
           disabled={isLoading}
         >
           마이크 켜기
         </button>
       ) : (
         <button 
           onClick={stopListening} 
           className="control-button"
           disabled={isLoading}
         >
           마이크 끄기
         </button>
       )}
       <button 
         onClick={clearTranscripts} 
         className="clear-button"
         disabled={isLoading}
       >
         기록 지우기
       </button>
     </div>
     
     <div className="transcript-box">
       <h3>현재 입력 중인 텍스트:</h3>
       <p>{transcript}</p>
       {isLoading && <p className="loading-text">전송 중...</p>}
     </div>

     <div className="saved-transcripts">
       <h3>저장된 문장 기록:</h3>
       <div className="transcripts-list">
         {savedTranscripts.map((text, index) => (
           <p key={index} className="transcript-item">
             {index + 1}. {text}
           </p>
         ))}
       </div>
     </div>
   </div>
 );
};

export default SpeechToText;
