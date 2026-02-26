package com.example.starter_project_2025.system.learning.dto;


import com.example.starter_project_2025.system.learning.enums.EnrollmentStatus;

import java.time.Instant;
import java.util.UUID;

public record EnrollmentResponse(
        UUID id,
        UUID cohortId,
        Instant enrolledAt,
        EnrollmentStatus status
) {
}
