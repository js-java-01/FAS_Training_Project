package com.example.starter_project_2025.system.auth.dto.register;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterCreateDTO {
    @Email(message = "Invalid email format", regexp = ".+@.+\\..+")
    private String email;
    @NotBlank(message = "Password cannot be blank")
    private String password;
    @NotBlank(message = "First name cannot be blank")
    private String firstName;
    @NotBlank(message = "Last name cannot be blank")
    private String lastName;

}
