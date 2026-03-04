package com.example.starter_project_2025.system.assessment.submission.dto;

import com.example.starter_project_2025.system.assessment.submission_question.SubmissionQuestionDTO;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class SubmissionDetailResponse {

    UUID submissionId;

    String assessmentTitle;

    Integer timeLimitMinutes;

    LocalDateTime startedAt;

    List<SubmissionQuestionDTO> questions;
}
