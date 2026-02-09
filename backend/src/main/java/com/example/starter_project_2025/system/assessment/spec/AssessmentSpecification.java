package com.example.starter_project_2025.system.assessment.spec;

import com.example.starter_project_2025.system.assessment.entity.Assessment;
import com.example.starter_project_2025.system.assessment.entity.AssessmentStatus;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.Map;


public final class AssessmentSpecification {

    private AssessmentSpecification() {
    }

    // ========= BASIC FIELDS =========

    public static Specification<Assessment> titleContains(String title) {
        return (root, query, cb) ->
                !StringUtils.hasText(title)
                        ? null
                        : cb.like(
                        cb.lower(root.get("title")),
                        "%" + title.toLowerCase() + "%"
                );
    }

    public static Specification<Assessment> codeContains(String code) {
        return (root, query, cb) ->
                !StringUtils.hasText(code)
                        ? null
                        : cb.like(
                        cb.lower(root.get("code")),
                        "%" + code.toLowerCase() + "%"
                );
    }

    public static Specification<Assessment> hasStatus(AssessmentStatus status) {
        return (root, query, cb) ->
                status == null
                        ? null
                        : cb.equal(root.get("status"), status);
    }

    public static Specification<Assessment> hasAssessmentType(Long assessmentTypeId) {
        return (root, query, cb) ->
                assessmentTypeId == null
                        ? null
                        : cb.equal(
                        root.get("assessmentType").get("id"),
                        assessmentTypeId
                );
    }

    public static Specification<Assessment> createdAfter(LocalDate fromDate) {
        return (root, query, cb) ->
                fromDate == null
                        ? null
                        : cb.greaterThanOrEqualTo(
                        root.get("createdAt"),
                        fromDate.atStartOfDay()
                );
    }

    public static Specification<Assessment> createdBefore(LocalDate toDate) {
        return (root, query, cb) ->
                toDate == null
                        ? null
                        : cb.lessThanOrEqualTo(
                        root.get("createdAt"),
                        toDate.atTime(23, 59, 59)
                );
    }

    // ========= KEYWORD SEARCH =========

    public static Specification<Assessment> keyword(String keyword) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(keyword)) {
                return null;
            }

            String like = "%" + keyword.toLowerCase() + "%";

            return cb.or(
                    cb.like(cb.lower(root.get("title")), like),
                    cb.like(cb.lower(root.get("code")), like),
                    cb.like(cb.lower(cb.coalesce(root.get("description"), "")), like)
            );
        };
    }

    // ========= COMPOSITE FILTER =========

    public static Specification<Assessment> withFilters(
            String keyword,
            Map<String, String> filters
    ) {

        Specification<Assessment> spec = Specification.where(null);

        // keyword search
        if (StringUtils.hasText(keyword)) {
            spec = spec.and(keyword(keyword));
        }

        if (filters != null) {

            // status
            AssessmentStatus status = parseStatus(filters.get("status"));
            if (status != null) {
                spec = spec.and(hasStatus(status));
            }

            // assessment type
            if (StringUtils.hasText(filters.get("assessmentTypeId"))) {
                try {
                    Long assessmentTypeId = Long.valueOf(filters.get("assessmentTypeId"));
                    spec = spec.and(hasAssessmentType(assessmentTypeId));
                } catch (NumberFormatException ignored) {
                    // ignore invalid value
                }
            }
        }

        return spec;
    }

    // ========= UTILS =========

    private static AssessmentStatus parseStatus(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return AssessmentStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
