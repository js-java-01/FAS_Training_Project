package com.example.starter_project_2025.system.auth.dto.role;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleSummaryDTO {
    private UUID id;
    private String name;
    private Set<String> permissions;
}
