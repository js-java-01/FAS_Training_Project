package com.example.starter_project_2025.system.user.dto;

import com.example.starter_project_2025.base.dto.CrudDto;
import com.example.starter_project_2025.base.dto.group.OnCreate;
import com.example.starter_project_2025.base.dto.group.OnUpdate;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import static com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY;
import static com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserDTO implements CrudDto<UUID> {

    @Null(groups = OnCreate.class)
    @NotNull(groups = OnUpdate.class)
    UUID id;

    @NotBlank(groups = OnCreate.class, message = "Email is required")
    @Email(groups = {OnCreate.class, OnUpdate.class}, message = "Email should be valid")
    String email;

    @JsonProperty(access = WRITE_ONLY)
    @Size(min = 8, groups = {OnCreate.class, OnUpdate.class}, message = "Password must be at least 8 characters long")
    String password;

    @NotBlank(groups = OnCreate.class, message = "First name is required")
    String firstName;

    String lastName;

    @NotNull(groups = OnCreate.class, message = "Active status is required")
    Boolean isActive;

    @NotEmpty(groups = OnCreate.class, message = "At least one role is required")
    Set<UUID> roleIds;

    @JsonProperty(access = READ_ONLY)
    LocalDateTime createdAt;

    @JsonProperty(access = READ_ONLY)
    LocalDateTime updatedAt;
}
