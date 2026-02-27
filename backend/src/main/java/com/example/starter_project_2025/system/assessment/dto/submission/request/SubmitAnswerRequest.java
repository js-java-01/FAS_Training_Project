package com.example.starter_project_2025.system.assessment.dto.submission.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SubmitAnswerRequest {

    UUID submissionQuestionId;
    String answerValue;


}
