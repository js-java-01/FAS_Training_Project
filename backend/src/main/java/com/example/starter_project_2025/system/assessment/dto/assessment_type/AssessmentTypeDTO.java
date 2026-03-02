package com.example.starter_project_2025.system.assessment.dto.assessment_type;

import com.example.starter_project_2025.base.dto.CrudDto;
import com.example.starter_project_2025.base.dto.group.OnCreate;
import com.example.starter_project_2025.base.dto.group.OnUpdate;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.UUID;

import static com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AssessmentTypeDTO implements CrudDto<UUID> {

    @Null(groups = OnCreate.class)
    @NotNull(groups = OnUpdate.class)
    UUID id;

    @NotBlank(groups = OnCreate.class, message = "Name is required")
    @Size(min = 5, max = 255, groups = {OnCreate.class, OnUpdate.class},
            message = "Name must be between 5 and 255 characters")
    String name;

    @Size(min = 10, max = 1000, groups = {OnCreate.class, OnUpdate.class},
            message = "Description must be between 10 and 1000 characters")
    String description;

    @JsonProperty(access = READ_ONLY)
    LocalDate createdAt;

    @JsonProperty(access = READ_ONLY)
    LocalDate updatedAt;
}