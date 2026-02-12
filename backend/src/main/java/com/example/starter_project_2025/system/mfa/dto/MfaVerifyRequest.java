package com.example.starter_project_2025.system.mfa.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MfaVerifyRequest {
    
    @NotBlank(message = "Code is required")
    private String code;
}
