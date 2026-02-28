package com.example.starter_project_2025.system.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.util.List;
import java.util.UUID;

@Builder
public record UserUpdateRequest(

        @Email(message = "Email must be valid")
        String email,

        @Size(min = 8, message = "Password must be at least 8 characters")
        String password,

        String firstName,

        String lastName,

        Boolean isActive,
        
        List<UUID> roleIds
) {
}
