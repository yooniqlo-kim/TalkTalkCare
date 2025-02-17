// CallNotification.tsx
import React, { useEffect, useState } from 'react';
import CallNotificationModal from '../../components/CallNotificationModal';

const WS_URL = import.meta.env.VITE_API_WS_URL;

interface CallInvitation {
  callerId: number;
  callerName: string;
  receiverName: string;
  message: string;
}

interface Props {
  userId: number;
}

const CallNotification: React.FC<Props> = ({ userId }) => {
  const [invitation, setInvitation] = useState<CallInvitation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");

  useEffect(() => {
    const socket = new WebSocket(`${WS_URL}?userId=${userId}`);
    
    socket.onmessage = (event) => {
      const data: CallInvitation = JSON.parse(event.data);
      console.log("받은 초대:", data);
      // 메시지가 정확히 일치하는지 확인합니다.
      const trimmedMessage = data.message.trim();
      console.log("trim한 메시지:", trimmedMessage);

      if (trimmedMessage.includes("화상통화 요청")) {
        console.log(data.message);
        setInvitation(data);
        // 모달에 표시할 메시지를 설정합니다.
        setModalMessage(`${data.callerName}님께서 ${data.receiverName}에게 화상통화 요청을 보냈습니다. 수락하시겠습니까?`);
        setIsModalOpen(true);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, [userId]);

  const handleAccept = () => {
    console.log("수락 버튼 클릭");
    // 추가 처리 로직 (예: OpenVidu 연결 API 호출)
    setIsModalOpen(false);
    setInvitation(null);
  };

  const handleReject = () => {
    console.log("거절 버튼 클릭");
    setIsModalOpen(false);
    setInvitation(null);
  };

  return (
    <>
      {/* 모달 메시지와 열림 상태를 이용하여 모달을 호출 */}
      <CallNotificationModal
        title="화상통화 요청"
        message={modalMessage}
        isOpen={isModalOpen}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </>
  );
};

export default CallNotification;
