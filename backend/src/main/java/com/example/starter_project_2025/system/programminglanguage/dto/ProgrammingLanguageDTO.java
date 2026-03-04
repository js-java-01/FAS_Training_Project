package com.example.starter_project_2025.system.programminglanguage.dto;

import com.example.starter_project_2025.base.dto.OnCreate;
import com.example.starter_project_2025.base.dto.OnUpdate;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

import static com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProgrammingLanguageDTO {

    @Null(groups = OnCreate.class)
    @NotNull(groups = OnUpdate.class)
    UUID id;

    @NotBlank(groups = OnCreate.class, message = "Name is required")
    @Size(max = 255, groups = {OnCreate.class, OnUpdate.class}, message = "Name must be at most 255 characters")
    String name;

    @NotBlank(groups = OnCreate.class, message = "Version is required")
    @Size(max = 255, groups = {OnCreate.class, OnUpdate.class}, message = "Version must be at most 255 characters")
    String version;

    @Size(max = 1000, groups = {OnCreate.class, OnUpdate.class}, message = "Description must be at most 1000 characters")
    String description;

    @JsonProperty("isSupported")
    @NotNull(groups = OnCreate.class, message = "Supported status is required")
    Boolean supported;

    @JsonProperty(access = READ_ONLY)
    LocalDateTime createdAt;

    @JsonProperty(access = READ_ONLY)
    LocalDateTime updatedAt;
}