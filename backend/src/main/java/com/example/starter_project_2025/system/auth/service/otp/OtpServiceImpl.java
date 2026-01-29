package com.example.starter_project_2025.system.auth.service.otp;

import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.StringRedisTemplate;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {
    private final StringRedisTemplate redisTemplate;

    @Override
    public void saveOtp(String email, String otp) {
        redisTemplate.opsForValue().set(email, otp, 5, TimeUnit.MINUTES);
    }

    @Override
    public String getOtp(String email) {
        return redisTemplate.opsForValue().get(email);
    }

    @Override
    public void deleteOtp(String email) {
        redisTemplate.delete(email);
    }

}
