package com.example.starter_project_2025.system.mfa.controller;

import com.example.starter_project_2025.security.UserDetailsImpl;
import com.example.starter_project_2025.system.mfa.dto.MfaSetupInitResponse;
import com.example.starter_project_2025.system.mfa.dto.MfaVerifyRequest;
import com.example.starter_project_2025.system.mfa.dto.MfaVerifyResponse;
import com.example.starter_project_2025.system.mfa.service.MfaService;
import com.example.starter_project_2025.system.mfa.service.MfaSessionService;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import com.example.starter_project_2025.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mfa")
@RequiredArgsConstructor
public class MfaController {

    private final MfaService mfaService;
    private final MfaSessionService mfaSessionService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    /**
     * POST /mfa/setup/init
     * Initialize MFA setup - generate secret and QR code URL
     */
    @PostMapping("/setup/init")
    public ResponseEntity<MfaSetupInitResponse> initSetup(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        System.out.println("=== MFA Setup Init ===");
        System.out.println("User ID: " + userDetails.getId());
        System.out.println("User Email: " + userDetails.getEmail());
        
        try {
            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new IllegalStateException("User not found"));

            System.out.println("User found: " + user.getEmail());

            // Generate secret
            System.out.println("Generating secret...");
            String secret = mfaService.generateSecret();
            System.out.println("Secret generated: " + secret);

            // Save credential (not enabled yet)
            System.out.println("Saving credential...");
            mfaService.initMfa(user, secret);
            System.out.println("Credential saved");

            // Build QR code URL
            System.out.println("Building QR code URL...");
            String qrCodeUrl = mfaService.buildOtpAuthUrl(
                    user.getEmail(),
                    secret,
                    "FAS Training System"
            );
            System.out.println("QR code URL: " + qrCodeUrl);

            MfaSetupInitResponse response = MfaSetupInitResponse.builder()
                    .secret(secret)
                    .qrCodeUrl(qrCodeUrl)
                    .build();
            
            System.out.println("Returning response");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error in initSetup: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * POST /mfa/setup/confirm
     * Confirm MFA setup by verifying the code
     */
    @PostMapping("/setup/confirm")
    public ResponseEntity<MfaVerifyResponse> confirmSetup(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody MfaVerifyRequest request
    ) {
        try {
            boolean isValid = mfaService.verifyCode(userDetails.getId(), request.getCode());

            if (isValid) {
                mfaService.enableMfa(userDetails.getId());
                return ResponseEntity.ok(MfaVerifyResponse.builder()
                        .success(true)
                        .message("MFA enabled successfully")
                        .build());
            } else {
                return ResponseEntity.badRequest().body(MfaVerifyResponse.builder()
                        .success(false)
                        .message("Invalid code")
                        .build());
            }
        } catch (MfaService.MfaLockedException e) {
            return ResponseEntity.status(423).body(MfaVerifyResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    /**
     * POST /mfa/step-up/verify
     * Verify TOTP for step-up authentication
     */
    @PostMapping("/step-up/verify")
    public ResponseEntity<MfaVerifyResponse> verifyStepUp(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody MfaVerifyRequest request,
            HttpServletRequest httpRequest
    ) {
        try {
            // Check if MFA is enabled
            if (!mfaService.isMfaEnabled(userDetails.getId())) {
                return ResponseEntity.badRequest().body(MfaVerifyResponse.builder()
                        .success(false)
                        .message("MFA not enabled for this user")
                        .build());
            }

            // Verify code
            boolean isValid = mfaService.verifyCode(userDetails.getId(), request.getCode());

            if (isValid) {
                // Extract JWT token
                String token = extractToken(httpRequest);
                if (token != null) {
                    String jti = jwtUtil.extractJti(token);
                    // Mark step-up as valid for 5 minutes
                    mfaSessionService.markStepUp(jti);
                }

                return ResponseEntity.ok(MfaVerifyResponse.builder()
                        .success(true)
                        .message("Step-up authentication successful")
                        .build());
            } else {
                return ResponseEntity.badRequest().body(MfaVerifyResponse.builder()
                        .success(false)
                        .message("Invalid code")
                        .build());
            }
        } catch (MfaService.MfaLockedException e) {
            return ResponseEntity.status(423).body(MfaVerifyResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    /**
     * POST /mfa/disable
     * Disable MFA (requires step-up)
     */
    @PostMapping("/disable")
    public ResponseEntity<MfaVerifyResponse> disableMfa(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody MfaVerifyRequest request
    ) {
        try {
            // Verify code before disabling
            boolean isValid = mfaService.verifyCode(userDetails.getId(), request.getCode());

            if (isValid) {
                mfaService.disableMfa(userDetails.getId());
                return ResponseEntity.ok(MfaVerifyResponse.builder()
                        .success(true)
                        .message("MFA disabled successfully")
                        .build());
            } else {
                return ResponseEntity.badRequest().body(MfaVerifyResponse.builder()
                        .success(false)
                        .message("Invalid code")
                        .build());
            }
        } catch (MfaService.MfaLockedException e) {
            return ResponseEntity.status(423).body(MfaVerifyResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    /**
     * GET /mfa/status
     * Check if MFA is enabled for current user
     */
    @GetMapping("/status")
    public ResponseEntity<MfaVerifyResponse> getMfaStatus(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        boolean enabled = mfaService.isMfaEnabled(userDetails.getId());
        return ResponseEntity.ok(MfaVerifyResponse.builder()
                .success(enabled)
                .message(enabled ? "MFA is enabled" : "MFA is not enabled")
                .build());
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
