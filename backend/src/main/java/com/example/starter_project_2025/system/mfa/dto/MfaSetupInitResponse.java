package com.example.starter_project_2025.system.mfa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MfaSetupInitResponse {
    private String secret;
    private String qrCodeUrl;
}
