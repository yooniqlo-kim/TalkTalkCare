package com.talktalkcare.domain.users.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "friends")
public class UserFriend {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "friend_id", nullable = false)
    private Integer friendId;

    @Column(name = "friend_name", nullable = false)
    private String friendName;

    public UserFriend(Integer userId, Integer friendId, String friendName) {
        this.userId = userId;
        this.friendId = friendId;
        this.friendName = friendName;
    }

    public void updateFriendName(String newName) {
        this.friendName = newName;
    }
}