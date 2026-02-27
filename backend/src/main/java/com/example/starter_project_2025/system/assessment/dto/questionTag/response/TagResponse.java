package com.example.starter_project_2025.system.assessment.dto.questionTag.response;

import lombok.Builder;

@Builder
public record TagResponse(
        Long id,
        String name,
        String description
) {}
