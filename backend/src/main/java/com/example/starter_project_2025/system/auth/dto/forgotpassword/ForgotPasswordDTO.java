package com.example.starter_project_2025.system.auth.dto.forgotpassword;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordDTO {
    @Email(message = "Invalid email format", regexp = ".+@.+\\..+")
    private String email;
    @Size(min = 6, max = 6, message = "OTP must be 6 characters long")
    private String otp;
    @NotBlank(message = "New password is required")
    private String newPassword;
}
