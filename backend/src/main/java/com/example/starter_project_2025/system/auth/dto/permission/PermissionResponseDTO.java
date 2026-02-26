package com.example.starter_project_2025.system.auth.dto.permission;

import lombok.*;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class PermissionResponseDTO
{
    private String type = "Bearer";
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private Set<String> permissions;
}
