package com.example.starter_project_2025.system.assessment.dto.submission.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class SubmissionQuestionResponse {

    private UUID id;
    private UUID originalQuestionId;
    private String questionType;
    private String content;
    private Double score;
    private Integer orderIndex;
    private Boolean isCorrect;
    private String userAnswer;
    private List<QuestionOptionResponse> options;

}
