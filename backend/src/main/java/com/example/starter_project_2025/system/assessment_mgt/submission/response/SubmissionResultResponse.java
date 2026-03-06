package com.example.starter_project_2025.system.assessment_mgt.submission.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SubmissionResultResponse {

    UUID submissionId;
    String assessmentTitle;
    Integer totalQuestions;
    Integer correctAnswers;
    Integer wrongAnswers;
    Integer unansweredQuestions;
    Double totalScore;
    Double maxScore;
    Double passScore;
    Boolean isPassed;
    LocalDateTime startedAt;
    LocalDateTime submittedAt;
    Long durationSeconds;
    List<SubmissionQuestionResponse> questionDetails;
}
