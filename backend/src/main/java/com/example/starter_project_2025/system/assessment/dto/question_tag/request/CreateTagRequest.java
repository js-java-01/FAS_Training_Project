package com.example.starter_project_2025.system.assessment.dto.question_tag.request;

import lombok.Builder;

@Builder
public record CreateTagRequest(
        String name,
        String description
) {}