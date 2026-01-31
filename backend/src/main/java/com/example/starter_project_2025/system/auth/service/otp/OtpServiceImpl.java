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
    public <T> String generatedOtpAndSave(String email, T DTO) {
        String otp = String.format("%06d", new java.util.Random().nextInt(1000000));
        String key = PREFIX + email + ":" + otp;
        redisService.save(key, DTO, 5, java.util.concurrent.TimeUnit.MINUTES);
        return otp;
    }

    @Override
    public <T> T verifyAndGetRegistrationData(String email, String otp, Class<T> clazz) {
        String key = PREFIX + email + ":" + otp;
        T data = redisService.get(key, clazz);
        if (data != null) {
            redisService.delete(key);
        }
        return data;
    }

}
