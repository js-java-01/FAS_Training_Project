package com.example.starter_project_2025.system.assessment.specification;

import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.Map;

public class AssessmentTypeSpecification {

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
