package com.example.starter_project_2025.system.assessment.spec;

import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public final class AssessmentTypeSpecification {
    private AssessmentTypeSpecification() {
    }

    public static Specification<AssessmentType> nameContains(String name) {
        return (root, query, cb) -> {
            if (name == null || name.isBlank()) {
                return null;
            }
            return cb.like(
                    cb.lower(root.get("name")),
                    "%" + name.toLowerCase() + "%"
            );
        };
    }

    // ========== createdAt >= from ==========
    public static Specification<AssessmentType> createdAfter(LocalDate from) {
        return (root, query, cb) -> {
            if (from == null) {
                return null;
            }
            return cb.greaterThanOrEqualTo(
                    root.get("createdAt"), from
            );
        };
    }

    public static Specification<AssessmentType> createdBefore(LocalDate to) {
        return (root, query, cb) -> {
            if (to == null) {
                return null;
            }
            return cb.lessThanOrEqualTo(
                    root.get("createdAt"), to
            );
        };
    }

    public static Specification<AssessmentType> keyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return null;
            }

            String like = "%" + keyword.toLowerCase() + "%";

            return cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("description")), like)
            );
        };
    }
}
