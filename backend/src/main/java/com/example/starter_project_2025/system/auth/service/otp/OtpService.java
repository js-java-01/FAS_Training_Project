package com.example.starter_project_2025.system.auth.service.otp;

import com.example.starter_project_2025.system.auth.dto.register.RegisterCreateDTO;

public interface OtpService {
    <T> String generatedOtpAndSave(String email, T DTO);

    <T> T verifyAndGetRegistrationData(String email, String otp, Class<T> clazz);

}
