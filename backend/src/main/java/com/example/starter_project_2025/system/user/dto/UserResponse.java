package com.example.starter_project_2025.system.user.dto;

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
public class UserResponse {

    UUID id;
    String email;
    String firstName;
    String lastName;
    Set<UUID> roleIds;
    Boolean isActive;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
