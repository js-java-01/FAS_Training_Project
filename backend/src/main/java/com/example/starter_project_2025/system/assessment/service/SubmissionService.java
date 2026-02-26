package com.example.starter_project_2025.system.assessment.service;

import com.example.starter_project_2025.system.assessment.dto.UserAssessmentDTO;
import com.example.starter_project_2025.system.assessment.dto.submission.request.StartSubmissionRequest;
import com.example.starter_project_2025.system.assessment.dto.submission.request.SubmitAnswerRequest;
import com.example.starter_project_2025.system.assessment.dto.submission.request.SubmitSubmissionRequest;
import com.example.starter_project_2025.system.assessment.dto.submission.response.SubmissionResponse;
import com.example.starter_project_2025.system.assessment.entity.Submission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface SubmissionService {

    Submission startSubmission(UUID userId, StartSubmissionRequest request);

    Submission submitAnswer(UUID submissionId, SubmitAnswerRequest request);

    Submission submitSubmission(UUID submissionId, SubmitSubmissionRequest request);

    Page<Submission> searchSubmissions(
            UUID userId,
            Long assessmentId,
            Pageable pageable
    );

    Submission getSubmissionById(UUID submissionId);

    // DTO methods with business logic
    SubmissionResponse getSubmissionResponseById(UUID submissionId);

    SubmissionResponse startSubmissionAndGetResponse(UUID userId, StartSubmissionRequest request);

    List<UserAssessmentDTO> getUserAssessments(UUID userId);
}
