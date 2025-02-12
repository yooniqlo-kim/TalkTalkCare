// AddFriendModal.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
// import '../styles/components/AddFriendModal.css';

interface AddFriendModalProps {
  onClose: () => void;
  onFriendAdded: () => Promise<void>;
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({ onClose, onFriendAdded }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userIdFromStorage = localStorage.getItem("userId");
    if (!userIdFromStorage) {
      setError('사용자 정보를 찾을 수 없습니다.');
      return;
    }

    if (!name.trim() || !phone.trim()) {
      setError('이름과 전화번호를 모두 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('http://localhost:8080/api/friends/add', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(userIdFromStorage),
          name: name.trim(),
          phone: phone.trim()
        })
      });

      const data = await response.json();

      if (data.result?.msg === 'success') {
        await onFriendAdded();
        onClose();
      } else {
        setError(data.message || '친구 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to add friend:', error);
      setError('친구 추가 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>친구 추가</h2>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">이름</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="친구 이름을 입력하세요"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">전화번호</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="전화번호를 입력하세요"
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-footer">
            <button 
              type="button" 
              onClick={onClose}
              disabled={isLoading}
              className="cancel-button"
            >
              취소
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading ? '처리 중...' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFriendModal;