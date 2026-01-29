package com.example.starter_project_2025.system.auth.service.otp;

import org.springframework.stereotype.Service;

import com.example.starter_project_2025.system.auth.dto.register.RegisterCreateDTO;
import com.example.starter_project_2025.system.auth.service.redis.RedisService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {
    private final RedisService redisService;
    private static final String PREFIX = "REG_DATA:";

    @Override
    public String generatedOtpAndSave(String email, RegisterCreateDTO registerCreateDTO) {
        String otp = String.format("%06d", new java.util.Random().nextInt(1000000));
        String key = PREFIX + email + ":" + otp;
        redisService.save(key, registerCreateDTO, 5, java.util.concurrent.TimeUnit.MINUTES);
        return otp;
    }

    @Override
    public RegisterCreateDTO verifyAndGetRegistrationData(String email, String otp) {
        String key = PREFIX + email + ":" + otp;
        RegisterCreateDTO registerCreateDTO = redisService.get(key, RegisterCreateDTO.class);
        if (registerCreateDTO != null) {
            redisService.delete(key);
        }
        return registerCreateDTO;
    }

}
