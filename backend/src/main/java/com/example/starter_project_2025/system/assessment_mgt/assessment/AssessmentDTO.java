package com.example.starter_project_2025.system.assessment_mgt.assessment;

import com.example.starter_project_2025.base.crud.dto.CrudDto;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AssessmentDTO implements CrudDto<UUID> {

    UUID id;

    UUID assessmentTypeId;

    Long programmingLanguageId;

    String code;

    String title;

    String description;

    Integer totalScore;

    AssessmentDifficulty difficulty;

    Integer passScore;

    Integer timeLimitMinutes;

    Integer attemptLimit;

    GradingMethod gradingMethod;

    Boolean isShuffleQuestion;

    Boolean isShuffleOption;

    AssessmentStatus status;

    List<Long> questionIds;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;
}
