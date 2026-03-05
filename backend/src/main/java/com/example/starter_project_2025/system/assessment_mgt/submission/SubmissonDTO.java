package com.example.starter_project_2025.system.assessment_mgt.submission;

import com.example.starter_project_2025.base.crud.dto.CrudDto;
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
public class SubmissonDTO implements CrudDto<UUID> {

    UUID id;

    UUID assessmentId;

    UUID courseClassId;

    UUID userId;

    SubmissionStatus status;

    Boolean isPassed;

    Integer attemptNumber;

    LocalDateTime startedAtFrom;

    LocalDateTime startedAtTo;

    LocalDateTime submittedAtFrom;

    LocalDateTime submittedAtTo;
}
