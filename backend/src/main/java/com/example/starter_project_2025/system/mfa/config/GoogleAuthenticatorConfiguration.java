package com.example.starter_project_2025.system.mfa.config;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class GoogleAuthenticatorConfiguration {

    private final MfaCredentialRepositoryAdapter credentialRepository;

    @Bean
    public GoogleAuthenticator googleAuthenticator() {
        GoogleAuthenticatorConfig config = new GoogleAuthenticatorConfig.GoogleAuthenticatorConfigBuilder()
            .build();
        
        GoogleAuthenticator authenticator = new GoogleAuthenticator(config);
        authenticator.setCredentialRepository(credentialRepository);
        
        return authenticator;
    }
}
