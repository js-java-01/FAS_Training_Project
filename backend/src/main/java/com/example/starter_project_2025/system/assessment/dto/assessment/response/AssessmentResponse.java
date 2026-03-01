package com.example.starter_project_2025.system.assessment.dto.assessment.response;

import com.example.starter_project_2025.system.assessment.enums.AssessmentDifficulty;
import com.example.starter_project_2025.system.assessment.enums.AssessmentStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AssessmentResponse {
    Long id;

    String code;

    String title;

    String description;

    Integer totalScore;

    Integer passScore;

    Integer timeLimitMinutes;

    Integer attemptLimit;

    Boolean isShuffleQuestion;

    Boolean isShuffleOption;

    AssessmentStatus status;

    String assessmentTypeId;

    String assessmentTypeName;

    AssessmentDifficulty difficulty;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;
}
