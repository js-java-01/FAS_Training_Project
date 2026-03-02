package com.example.starter_project_2025.system.assessment.dto.question_tag.response;

public record TagCountResponse(
        Long id,
        String name,
        Long questionCount
) {}