package com.example.starter_project_2025.system.assessment.dto.question_tag.response;

import lombok.Builder;

@Builder
public record TagResponse(
        Long id,
        String name,
        String description
) {}
