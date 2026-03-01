package com.example.starter_project_2025.system.mfa.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MfaSessionService {

    private final ConcurrentHashMap<String, Instant> stepUpStore = new ConcurrentHashMap<>();

    /**
     * Mark a JWT token (jti) as step-up authenticated
     * Valid for 5 minutes
     */
    public void markStepUp(String jti) {
        if (jti == null || jti.isEmpty()) {
            System.out.println("[MFA_SESSION] markStepUp called with null/empty jti - ignoring");
            return;
        }

        Instant expiry = Instant.now().plus(5, ChronoUnit.MINUTES);
        stepUpStore.put(jti, expiry);

        // Clean up expired entries periodically
        cleanupExpired();
    }

    /**
     * Check if a JWT token (jti) has valid step-up authentication
     */
    public boolean isStepUpValid(String jti) {
        Instant expiry = stepUpStore.get(jti);

        if (expiry == null) {
            return false;
        }

        if (expiry.isBefore(Instant.now())) {
            stepUpStore.remove(jti);
            return false;
        }

        return true;
    }

    /**
     * Remove step-up for a specific jti
     */
    public void removeStepUp(String jti) {
        stepUpStore.remove(jti);
    }

    /**
     * Clean up expired entries
     */
    private void cleanupExpired() {
        Instant now = Instant.now();
        stepUpStore.entrySet().removeIf(entry -> entry.getValue().isBefore(now));
    }

    /**
     * Clear all step-up sessions (for testing or maintenance)
     */
    public void clearAll() {
        stepUpStore.clear();
    }
}
