package com.example.starter_project_2025.system.auth.dto.forgotpassword;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordCreateDTO {
    @Email(message = "Invalid email format", regexp = ".+@.+\\..+")
    private String email;

}
