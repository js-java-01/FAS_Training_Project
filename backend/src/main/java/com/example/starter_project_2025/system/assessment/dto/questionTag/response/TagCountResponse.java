package com.example.starter_project_2025.system.assessment.dto.questionTag.response;

import lombok.Builder;

@Builder
public record TagCountResponse(
        Long id,
        String name,
        Long questionCount
) {

}