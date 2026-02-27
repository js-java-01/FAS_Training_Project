package com.example.starter_project_2025.system.assessment.dto.question.request;

import lombok.Builder;
import lombok.Data;

@Builder
public record UpdateQuestionOptionDTO (
     String content,
     boolean correct,
     Integer orderIndex
    ){

}
