package com.example.starter_project_2025.system.learning_online.dto;

import com.example.starter_project_2025.system.learning_online.enums.EnrollmentStatusOnline;

import java.time.Instant;
import java.util.UUID;

public record EnrollmentOnlineResponse(
        UUID id,
        UUID courseId,
        Instant enrolledAt,
        EnrollmentStatusOnline status) {
}