import axios from 'axios';

export const ttsService = {
  textToSpeech: async (text: string) => {
    try {
      const response = await axios.post(
        'https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts',
        new URLSearchParams({
          'speaker': 'nara',
          'text': text,
          'volume': '0',
          'speed': '0',
          'pitch': '0'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-NCP-APIGW-API-KEY-ID': import.meta.env.VITE_NAVER_CLIENT_ID,
            'X-NCP-APIGW-API-KEY': import.meta.env.VITE_NAVER_CLIENT_SECRET,
            // CORS 해결을 위한 헤더 추가
            'Access-Control-Allow-Origin': '*'
          },
          responseType: 'blob',
          // 프록시 설정
          proxy: {
            host: 'localhost',
            port: 5173
          }
        }
      );

      // Blob을 오디오로 재생
      const audioBlob = new Blob([response.data], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await new Promise((resolve) => {
        audio.onended = resolve;
        audio.play();
      });

    } catch (error) {
      console.error('TTS 오류:', error);
      // 폴백 음성 합성 메서드
      await fallbackTextToSpeech(text);
    }
  }
};

// 폴백 음성 합성 메서드
const fallbackTextToSpeech = async (text: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('음성 합성을 지원하지 않는 브라우저입니다.');
  }
};