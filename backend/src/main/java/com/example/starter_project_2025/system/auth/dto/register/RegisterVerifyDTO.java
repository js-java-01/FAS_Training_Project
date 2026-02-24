package com.example.starter_project_2025.system.auth.dto.register;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterVerifyDTO {
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Invalid email format", regexp = ".+@.+\\..+")
    private String email;
    @NotBlank(message = "Verification code cannot be blank")
    @Size(min = 6, max = 6, message = "Verification code must be 6 characters long")
    private String code;
}
