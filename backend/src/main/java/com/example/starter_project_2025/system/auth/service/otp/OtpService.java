package com.example.starter_project_2025.system.auth.service.otp;

import com.example.starter_project_2025.system.auth.dto.register.RegisterCreateDTO;

public interface OtpService {
    String generatedOtpAndSave(String email, RegisterCreateDTO registerCreateDTO);

    RegisterCreateDTO verifyAndGetRegistrationData(String email, String otp);

}
