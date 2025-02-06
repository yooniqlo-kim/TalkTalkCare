import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { friendApi } from '../api/friendApi';
import { Friend, FriendStatusUpdate } from '../../types/friend';
import FriendItem from './FriendItem';
import AddFriendModal from './AddFriendModal';
import styles from './FriendList.module.css';

interface FriendListProps {
    userId: number;
}

const FriendList: React.FC<FriendListProps> = ({ userId }) => {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [showAddFriend, setShowAddFriend] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadFriends = async () => {
        try {
            const data = await friendApi.getFriends(userId);
            if (data.result?.msg === 'success') {
                setFriends(data.body);
                setError(null);
            }
        } catch (error) {
            setError('친구 목록을 불러오는데 실패했습니다.');
            console.error('친구 목록 로딩 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddFriend = async (request: { userId: number; phone: string; name: string }) => {
        try {
            const data = await friendApi.addFriend(request);
            if (data.result?.msg === 'success') {
                loadFriends();
            }
        } catch (error) {
            console.error('친구 추가 실패:', error);
        }
    };

    const handleWebSocketMessage = (data: Friend | FriendStatusUpdate) => {
        if ('phone' in data) {
            // Friend 타입인 경우 (전체 친구 정보 업데이트)
            setFriends(prev => prev.map(friend => 
                friend.userId === data.userId ? data : friend
            ));
        } else {
            // FriendStatusUpdate 타입인 경우 (상태만 업데이트)
            setFriends(prev => prev.map(friend => 
                friend.userId === data.userId 
                    ? { ...friend, status: data.status, lastActiveTime: data.lastActiveTime, displayStatus: data.displayStatus }
                    : friend
            ));
        }
    };

    useEffect(() => {
        loadFriends();
    }, [userId]);

    useWebSocket(
        `${process.env.REACT_APP_WS_URL}/ws/friend/${userId}`,
        handleWebSocketMessage
    );

    const handleRemoveFriend = async (friendId: number) => {
        try {
            await friendApi.removeFriend(userId, friendId);
            loadFriends();
        } catch (error) {
            console.error('친구 삭제 실패:', error);
        }
    };

    if (isLoading) return <div>로딩 중...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>친구 목록</h2>
                <button 
                    onClick={() => setShowAddFriend(true)}
                    className={styles.addButton}
                >
                    친구 추가
                </button>
            </div>
            <div className={styles.friendList}>
                {friends.length === 0 ? (
                    <div className={styles.emptyState}>
                        아직 등록된 친구가 없습니다.
                    </div>
                ) : (
                    friends.map(friend => (
                        <FriendItem 
                            key={friend.userId}
                            friend={friend}
                            onRemove={() => handleRemoveFriend(friend.userId)}
                        />
                    ))
                )}
            </div>
            {showAddFriend && (
                <AddFriendModal 
                    userId={userId}
                    onClose={() => setShowAddFriend(false)}
                    onAdd={handleAddFriend}
                />
            )}
        </div>
    );
};

export default FriendList;