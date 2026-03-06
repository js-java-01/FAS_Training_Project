package com.example.starter_project_2025.system.assessment.assessment;

import com.example.starter_project_2025.base.dto.OnCreate;
import com.example.starter_project_2025.base.dto.OnUpdate;
import com.example.starter_project_2025.system.assessment.assessment.enums.AssessmentDifficulty;
import com.example.starter_project_2025.system.assessment.assessment.enums.AssessmentStatus;
import com.example.starter_project_2025.system.assessment.assessment.enums.GradingMethod;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AssessmentDTO {

    @Null(groups = OnCreate.class)
    @NotNull(groups = OnUpdate.class)
    UUID id;

    @NotBlank(groups = OnCreate.class, message = "Code is required")
    @Size(max = 100, groups = {OnCreate.class, OnUpdate.class})
    String code;

    @NotBlank(groups = OnCreate.class, message = "Title is required")
    @Size(max = 255, groups = {OnCreate.class, OnUpdate.class})
    String title;

    @Size(max = 500, groups = {OnCreate.class, OnUpdate.class})
    String description;

    @Min(value = 0, groups = {OnCreate.class, OnUpdate.class})
    int totalScore;

    @Min(value = 0, groups = {OnCreate.class, OnUpdate.class})
    int passScore;

    @Min(value = 0, groups = {OnCreate.class, OnUpdate.class})
    int timeLimitMinutes;

    @Min(value = 1, groups = {OnCreate.class, OnUpdate.class})
    int attemptLimit;

    @NotNull(groups = OnCreate.class, message = "Difficulty is required")
    AssessmentDifficulty difficulty;

    GradingMethod gradingMethod;

    @NotNull(groups = OnCreate.class, message = "Status is required")
    AssessmentStatus status;

    boolean isShuffleQuestion;

    boolean isShuffleOption;

    @NotNull(groups = OnCreate.class, message = "Assessment type is required")
    UUID assessmentTypeId;

    @JsonProperty(access = READ_ONLY)
    List<UUID> questionIds;

    @JsonProperty(access = READ_ONLY)
    Integer submissionCount;

    @JsonProperty(access = READ_ONLY)
    LocalDateTime createdAt;

    @JsonProperty(access = READ_ONLY)
    LocalDateTime updatedAt;
}
