package com.talktalkcare.domain.dementia.repository;
import com.talktalkcare.domain.dementia.entity.DementiaTestResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DementiaRepository extends JpaRepository<DementiaTestResult, Long> {
    ;

    @Query("""
                SELECT dtr FROM DementiaTestResult dtr
                WHERE dtr.user.email = :email
            """)
    List<DementiaTestResult> findDementiaTestResultByUserEmail(@Param("email") String email);

}
