package com.example.starter_project_2025.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class GeminiConfig {

    @Value("${gemini.api-key}")
    private String apiKey;

    @Bean
    public RestTemplate geminiRestTemplate() {
        return new RestTemplate();
    }

    @Bean
    public String geminiApiKey() {
        return apiKey;
    }
}