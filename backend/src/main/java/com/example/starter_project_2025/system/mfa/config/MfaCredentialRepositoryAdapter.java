package com.example.starter_project_2025.system.mfa.config;

import com.example.starter_project_2025.system.mfa.entity.MfaCredential;
import com.example.starter_project_2025.system.mfa.repository.MfaCredentialRepository;
import com.warrenstrange.googleauth.ICredentialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Adapter to bridge our MfaCredentialRepository with Google Authenticator's ICredentialRepository
 */
@Component
@RequiredArgsConstructor
public class MfaCredentialRepositoryAdapter implements ICredentialRepository {

    private final MfaCredentialRepository mfaCredentialRepository;

    @Override
    public String getSecretKey(String userName) {
        // userName is actually userId in string format
        try {
            UUID userId = UUID.fromString(userName);
            return mfaCredentialRepository.findByUserId(userId)
                .map(MfaCredential::getSecretEnc)
                .orElse(null);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    @Override
    public void saveUserCredentials(String userName, String secretKey, int validationCode, List<Integer> scratchCodes) {
        // We handle credential saving separately in MfaService
        // This method is not used in our flow
    }
}
