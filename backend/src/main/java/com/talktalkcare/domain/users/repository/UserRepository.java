package com.talktalkcare.domain.users.repository;

import com.talktalkcare.domain.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByLoginId(String loginId);
}

