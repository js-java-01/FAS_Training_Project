package com.example.starter_project_2025.system.auth.dto.permission;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PermissionResponse {

    UUID id;
    String name;
    String description;
    String resource;
    String action;
    Boolean isActive;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
