package com.example.starter_project_2025.system.assessment.spec;

import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.Map;

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

    public static Specification<AssessmentType> withFilters(String keyword, Map<String, String> filters) {
        return (root, query, cb) -> {
            Specification<AssessmentType> spec = Specification.where(null);

            if (StringUtils.hasText(keyword)) {
                String likePattern = "%" + keyword.toLowerCase() + "%";
                spec = spec.and((r, q, c) -> c.or(
                        c.like(c.lower(r.get("name")), likePattern),
                        c.like(c.lower(c.coalesce(r.get("description"), "")), likePattern)));
            }

            if (filters != null && !filters.isEmpty()) {
                for (Map.Entry<String, String> entry : filters.entrySet()) {
                    if (StringUtils.hasText(entry.getValue())) {
                        // Add logic for specific filters here if needed
                        // For now, simpler implementation
                    }
                }
            }

            return spec.toPredicate(root, query, cb);
        };
    }
}
