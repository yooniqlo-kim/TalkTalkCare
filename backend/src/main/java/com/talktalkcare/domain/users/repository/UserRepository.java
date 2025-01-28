package com.talktalkcare.domain.users.repository;

import com.talktalkcare.domain.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    
    Optional<User> findByLoginId(String loginId);

    boolean existsByLoginId(String loginId);

}

