package com.example.starter_project_2025.system.auth.service.redis;

import java.util.concurrent.TimeUnit;

import com.fasterxml.jackson.core.JsonProcessingException;

public interface RedisService {
    void save(String key, Object value, long timeout, TimeUnit unit);

    <T> T get(String key, Class<T> clazz);

    void delete(String key);

}
