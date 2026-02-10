package com.example.starter_project_2025.system.assessment.submission.spec;

import com.example.starter_project_2025.system.assessment.submission.entity.Submission;
import com.example.starter_project_2025.system.assessment.submission.entity.SubmissionStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.UUID;

public class SubmissionSpecification {

    private SubmissionSpecification() {
    }

    public static Specification<Submission> hasUserId(UUID userId) {
        return (root, query, cb) ->
                userId == null ? null : cb.equal(root.get("user").get("id"), userId);
    }

    public static Specification<Submission> hasAssessmentTypeId(UUID assessmentTypeId) {
        return (root, query, cb) ->
                assessmentTypeId == null ? null :
                        cb.equal(root.get("assessmentType").get("id"), assessmentTypeId);
    }

    public static Specification<Submission> hasStatus(SubmissionStatus status) {
        return (root, query, cb) ->
                status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Submission> isPassed(Boolean isPassed) {
        return (root, query, cb) ->
                isPassed == null ? null : cb.equal(root.get("isPassed"), isPassed);
    }

    public static Specification<Submission> startedAfter(LocalDateTime from) {
        return (root, query, cb) ->
                from == null ? null : cb.greaterThanOrEqualTo(root.get("startedAt"), from);
    }

    public static Specification<Submission> startedBefore(LocalDateTime to) {
        return (root, query, cb) ->
                to == null ? null : cb.lessThanOrEqualTo(root.get("startedAt"), to);
    }
}
