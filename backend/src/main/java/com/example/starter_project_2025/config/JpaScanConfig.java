package com.example.starter_project_2025.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackages = {
        "com.example.starter_project_2025.system"
})
@EntityScan(basePackages = {
        "com.example.starter_project_2025.system"
})
public class JpaScanConfig {
}

