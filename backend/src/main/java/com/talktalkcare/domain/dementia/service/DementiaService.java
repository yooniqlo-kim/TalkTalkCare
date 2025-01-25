package com.talktalkcare.domain.dementia.service;

import com.talktalkcare.domain.dementia.repository.DementiaRepository;
import com.talktalkcare.domain.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DementiaService {

    private final DementiaRepository dementiaRepository;

}
