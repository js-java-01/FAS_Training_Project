package com.example.starter_project_2025.system.learning_online.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record EnrollmentOnlineRequest(
                @NotNull UUID courseId) {
}