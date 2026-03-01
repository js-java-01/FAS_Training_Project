package com.example.starter_project_2025.system.auth.dto.role;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleResponse {

    UUID id;
    String name;
    String description;
    Boolean isActive;
    Set<UUID> permissionIds;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
