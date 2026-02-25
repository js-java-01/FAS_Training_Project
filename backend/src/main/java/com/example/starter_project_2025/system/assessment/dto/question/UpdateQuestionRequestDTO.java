package com.example.starter_project_2025.system.assessment.dto.question;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class UpdateQuestionRequestDTO {
    private UUID questionCategoryId;

    // SINGLE, MULTIPLE
    private String questionType;

    private String content;

    private Boolean isActive;

    private List<UpdateOptionDTO> options;

    @Data
    public static class UpdateOptionDTO {

        private String content;
        private boolean correct;
        private Integer orderIndex;
    }
}
