package com.example.starter_project_2025.system.assessment.service;

import com.example.starter_project_2025.system.assessment.dto.submission.request.StartSubmissionRequest;
import com.example.starter_project_2025.system.assessment.dto.submission.request.SubmitAnswerRequest;
import com.example.starter_project_2025.system.assessment.dto.submission.request.SubmitSubmissionRequest;
import com.example.starter_project_2025.system.assessment.entity.Submission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface SubmissionService {

    public Submission startSubmission(UUID userId, StartSubmissionRequest request);

    public Submission submitAnswer(UUID submissionId, SubmitAnswerRequest request);

    public Submission submitSubmission(UUID submissionId, SubmitSubmissionRequest request);

    Page<Submission> searchSubmissions(
            UUID userId,
            UUID assessmentTypeId,
            Pageable pageable
    );

    public Submission getSubmissionById(UUID submissionId);
}
