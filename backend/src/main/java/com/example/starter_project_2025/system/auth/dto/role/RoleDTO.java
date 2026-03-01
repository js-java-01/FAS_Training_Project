package com.example.starter_project_2025.system.auth.dto.role;

import com.example.starter_project_2025.base.dto.CrudDto;
import com.example.starter_project_2025.base.dto.group.OnCreate;
import com.example.starter_project_2025.base.dto.group.OnUpdate;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Null;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import static com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleDTO implements CrudDto<UUID> {

    @Null(groups = OnCreate.class)
    @NotNull(groups = OnUpdate.class)
    UUID id;

    @NotBlank(groups = OnCreate.class, message = "Role name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    String name;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    String description;

    @NotNull(groups = OnCreate.class, message = "Active status is required")
    Boolean isActive;

    @NotNull(groups = OnCreate.class, message = "Permission IDs are required")
    Set<UUID> permissionIds;

    @JsonProperty(access = READ_ONLY)
    LocalDateTime createdAt;

    @JsonProperty(access = READ_ONLY)
    LocalDateTime updatedAt;
}
