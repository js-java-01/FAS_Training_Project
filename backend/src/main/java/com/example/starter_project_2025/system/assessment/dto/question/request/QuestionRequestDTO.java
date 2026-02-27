package com.example.starter_project_2025.system.assessment.dto.question.request;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class QuestionRequestDTO {

    private UUID questionCategoryId;

    private String questionType; // SINGLE, MULTIPLE

    private String content;

    private List<OptionDTO> options;

    @Data
    public static class OptionDTO {
        private String content;
        private boolean correct;
        private Integer orderIndex;
    }
}
