package com.talktalkcare.domain.talktalkAI.repository;

import com.talktalkcare.domain.talktalkAI.entity.TalkTalk;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TalkTalkRepository extends JpaRepository<TalkTalk, Long> {

    TalkTalk findByUserId(int userId);
}
