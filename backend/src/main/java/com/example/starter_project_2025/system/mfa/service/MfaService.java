package com.example.starter_project_2025.system.mfa.service;

import com.example.starter_project_2025.system.mfa.entity.MfaCredential;
import com.example.starter_project_2025.system.mfa.repository.MfaCredentialRepository;
import com.example.starter_project_2025.system.user.entity.User;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MfaService {

    private final MfaCredentialRepository mfaCredentialRepository;
    private final GoogleAuthenticator googleAuthenticator;

    /**
     * Generate a new TOTP secret for a user
     */
    public String generateSecret() {
        GoogleAuthenticatorKey key = googleAuthenticator.createCredentials();
        return key.getKey();
    }

    /**
     * Build OTP Auth URL for QR code generation
     */
    public String buildOtpAuthUrl(String userEmail, String secret, String issuer) {
        return GoogleAuthenticatorQRGenerator.getOtpAuthURL(
            issuer,
            userEmail,
            googleAuthenticator.createCredentials(secret)
        );
    }

    /**
     * Verify TOTP code with lockout logic
     */
    @Transactional
    public boolean verifyCode(UUID userId, String code) {
        MfaCredential credential = mfaCredentialRepository.findByUserId(userId)
            .orElseThrow(() -> new IllegalStateException("MFA not set up for this user"));

        // Check if account is locked
        if (credential.getLockedUntil() != null && credential.getLockedUntil().isAfter(Instant.now())) {
            throw new MfaLockedException("Account is temporarily locked. Try again later.");
        }

        // Verify the code using secret key directly
        boolean isValid = googleAuthenticator.authorize(credential.getSecretEnc(), Integer.parseInt(code));

        if (!isValid) {
            // Increment failed attempts
            credential.setFailedAttempts(credential.getFailedAttempts() + 1);

            // Lock account if failed attempts >= 5
            if (credential.getFailedAttempts() >= 5) {
                credential.setLockedUntil(Instant.now().plus(1, ChronoUnit.HOURS));
                credential.setFailedAttempts(0);
            }

            mfaCredentialRepository.save(credential);
            return false;
        }

        // Reset failed attempts on success
        if (credential.getFailedAttempts() > 0) {
            credential.setFailedAttempts(0);
            mfaCredentialRepository.save(credential);
        }

        return true;
    }

    /**
     * Initialize MFA for a user
     */
    @Transactional
    public MfaCredential initMfa(User user, String secret) {
        MfaCredential credential = mfaCredentialRepository.findByUserId(user.getId())
            .orElse(MfaCredential.builder()
                .user(user)
                .enabled(false)
                .failedAttempts(0)
                .build());

        credential.setSecretEnc(secret);
        return mfaCredentialRepository.save(credential);
    }

    /**
     * Enable MFA after verification
     */
    @Transactional
    public void enableMfa(UUID userId) {
        MfaCredential credential = mfaCredentialRepository.findByUserId(userId)
            .orElseThrow(() -> new IllegalStateException("MFA not initialized"));
        credential.setEnabled(true);
        mfaCredentialRepository.save(credential);
    }

    /**
     * Disable MFA
     */
    @Transactional
    public void disableMfa(UUID userId) {
        MfaCredential credential = mfaCredentialRepository.findByUserId(userId)
            .orElseThrow(() -> new IllegalStateException("MFA not found"));
        credential.setEnabled(false);
        mfaCredentialRepository.save(credential);
    }

    /**
     * Check if user has MFA enabled
     */
    public boolean isMfaEnabled(UUID userId) {
        return mfaCredentialRepository.findByUserId(userId)
            .map(MfaCredential::isEnabled)
            .orElse(false);
    }

    /**
     * Custom exception for locked accounts
     */
    public static class MfaLockedException extends RuntimeException {
        public MfaLockedException(String message) {
            super(message);
        }
    }
}
