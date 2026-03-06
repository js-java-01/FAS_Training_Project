package com.example.starter_project_2025.system.assessment_mgt.submission.request;

import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StartSubmissionRequest {

    @NotNull(message = "Assessment ID is required")
    UUID assessmentId;

}
