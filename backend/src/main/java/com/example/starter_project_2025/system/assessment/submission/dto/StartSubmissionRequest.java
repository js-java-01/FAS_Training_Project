package com.example.starter_project_2025.system.assessment.submission.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class StartSubmissionRequest {
    UUID assessmentId;

    UUID userId;
}
