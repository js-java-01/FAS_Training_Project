package com.example.starter_project_2025.system.assessment.dto.question.request;

import lombok.Data;

@Data
public class UpdateQuestionOptionDTO {
    private String content;
    private boolean correct;
    private Integer orderIndex;

}
