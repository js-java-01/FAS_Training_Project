package com.example.starter_project_2025.system.assessment.dto.question;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class QuestionRequestDTO {
    private String content;
    private String questionType; // SINGLE, MULTIPLE
    private UUID categoryId;
    private List<OptionDTO> options;

    @Data
    public static class OptionDTO {
        private String content;
        private boolean isCorrect;
        private Integer orderIndex;
    }
}