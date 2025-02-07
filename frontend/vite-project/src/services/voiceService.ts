import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const voiceService = {
  sendTranscript: async (transcript: string) => {
    try {
      const response = await axios.post('/talktalk', {
        text: transcript
      });
      return response.data;
    } catch (error) {
      console.error('음성 텍스트 전송 실패:', error);
      throw error;
    }
  }
};