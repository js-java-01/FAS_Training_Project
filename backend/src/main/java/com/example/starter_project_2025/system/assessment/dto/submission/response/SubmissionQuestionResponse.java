package com.example.starter_project_2025.system.assessment.dto.submission.response;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class SubmissionQuestionResponse {

    private UUID id;
    private String questionType;
    private String content;
    private Integer score;
    private Integer orderIndex;

}
