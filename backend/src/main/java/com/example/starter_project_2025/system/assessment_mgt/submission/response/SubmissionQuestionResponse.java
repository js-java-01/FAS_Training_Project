package com.example.starter_project_2025.system.assessment_mgt.submission.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SubmissionQuestionResponse {

    UUID id;
    UUID originalQuestionId;
    String questionType;
    String content;
    Double score;
    Double earnedScore;
    Integer orderIndex;
    Boolean isCorrect;
    String userAnswer;
    String correctAnswer;
    List<QuestionOptionResponse> options;
}
