package com.example.starter_project_2025.system.learning.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record EnrollmentRequest(
        @NotNull UUID cohortId
) {
}
