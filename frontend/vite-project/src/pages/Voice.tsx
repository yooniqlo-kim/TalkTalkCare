import React, { useState, useEffect } from 'react';
import "../styles/components/Voice.css" 

const SpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  // Web Speech API 설정
  let recognition: any = null;

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ko-KR';

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      recognition.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="speech-to-text-container">
      <div className="controls">
        {!isListening ? (
          <button onClick={startListening}>
            마이크 켜기
          </button>
        ) : (
          <button onClick={stopListening}>
            마이크 끄기
          </button>
        )}
      </div>
      
      <div className="transcript-box">
        <h3>인식된 텍스트:</h3>
        <p>{transcript}</p>
      </div>
    </div>
  );
};

export default SpeechToText;