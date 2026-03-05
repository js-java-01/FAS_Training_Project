package com.example.starter_project_2025.system.assessment_mgt.submission;

import com.example.starter_project_2025.base.crud.dto.FilterOperator;
import com.example.starter_project_2025.base.spec.FilterField;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record SubmissonFilter (
    @FilterField(entityField = "assessment.id")
    UUID assessmentId,

    @FilterField(entityField = "courseClass.id")
    UUID courseClassId,

    @FilterField(entityField = "user.id")
    UUID userId,

    @FilterField(entityField = "status")
    SubmissionStatus status,

    @FilterField(entityField = "isPassed")
    Boolean isPassed,

    @FilterField(entityField = "attemptNumber")
    Integer attemptNumber,

    @FilterField(entityField = "startedAt", operator = FilterOperator.BETWEEN)
    List<LocalDateTime> startedAtRange,

    @FilterField(entityField = "submittedAt", operator = FilterOperator.BETWEEN)
    List<LocalDateTime> submittedAtRange
) {

}
