package com.example.starter_project_2025.system.auth.service.redis;

import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RedisServiceImpl implements RedisService {
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public void save(String key, Object value, long timeout, TimeUnit unit) {
        try {

            String stringValue = objectMapper.writeValueAsString(value);
            redisTemplate.opsForValue().set(key, stringValue, timeout, unit);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Fail to convert", e);
        }
    }

    @Override
    public <T> T get(String key, Class<T> clazz) {
        String value = redisTemplate.opsForValue().get(key);
        if (value == null) {
            return null;
        }
        try {
            return objectMapper.readValue(value, clazz);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Fail to convert", e);
        }
    }

    @Override
    public void delete(String key) {
        redisTemplate.delete(key);
    }

}
