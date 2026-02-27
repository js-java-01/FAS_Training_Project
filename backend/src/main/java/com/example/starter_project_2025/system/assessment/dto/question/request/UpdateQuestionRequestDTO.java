package com.example.starter_project_2025.system.assessment.dto.question.request;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Builder
public record UpdateQuestionRequestDTO(

        UUID questionCategoryId,

        // SINGLE, MULTIPLE
        String questionType,

        String content,

        Boolean isActive,

        List<UpdateOptionDTO> options,
        List<Long> tagIds

) {

    public record UpdateOptionDTO(
            String content,
            Boolean correct,
            Integer orderIndex
    ) {}
}
