package com.example.starter_project_2025.system.assessment.dto.questionTag.request;

import lombok.Builder;

@Builder
public record UpdateTagRequest(
        String name,
        String description,
        Boolean active
) {}