package com.example.starter_project_2025.system.assessment.submission;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubmissionRepository extends JpaRepository<Submission, UUID> {

    int countByAssessmentIdAndUserId(UUID assessmentId, UUID userId);

    Optional<Submission> findTopByAssessmentIdAndUserIdOrderByAttemptNumberDesc(
            UUID assessmentId, UUID userId);

    boolean existsByAssessmentIdAndUserIdAndStatus(
            UUID assessmentId, UUID userId, SubmissionStatus status);
}
