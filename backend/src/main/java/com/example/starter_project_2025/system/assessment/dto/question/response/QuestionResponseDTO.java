package com.example.starter_project_2025.system.assessment.dto.question.response;

import lombok.Builder;

import java.util.List;
import java.util.UUID;

@Builder
public record QuestionResponseDTO(

        UUID id,

        String content,

        String questionType,

        Boolean isActive,

        CategoryDTO category,

        List<OptionDTO> options,

        List<TagDTO> tags

) {

    public record CategoryDTO(
            UUID id,
            String name
    ) {}

    public record OptionDTO(
            UUID id,
            String content,
            Boolean correct,
            Integer orderIndex
    ) {}

    public record TagDTO(
            Long id,
            String name
    ) {}
}
