package com.talktalkcare.domain.dementia.repository;
import com.talktalkcare.domain.dementia.entity.DementiaTestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DementiaRepository extends JpaRepository<DementiaTestResult, Long> {
    ;


}
