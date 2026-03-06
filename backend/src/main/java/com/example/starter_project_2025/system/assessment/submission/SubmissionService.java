package com.example.starter_project_2025.system.assessment.submission;

import com.example.starter_project_2025.system.assessment.submission.dto.StartSubmissionResponse;
import com.example.starter_project_2025.system.assessment.submission.dto.SubmissionDetailResponse;
import com.example.starter_project_2025.system.assessment.submission.dto.SubmissionResultResponse;

import java.util.List;
import java.util.UUID;

public interface SubmissionService {

    StartSubmissionResponse startSubmission(UUID assessmentId);

    void saveAnswer(UUID submissionQuestionId, List<UUID> selectedOptionIds);

    SubmissionResultResponse submit(UUID submissionId);

    SubmissionDetailResponse getDetail(UUID submissionId);
}
