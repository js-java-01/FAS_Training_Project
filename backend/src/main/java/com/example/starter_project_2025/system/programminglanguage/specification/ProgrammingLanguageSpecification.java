package com.example.starter_project_2025.system.programminglanguage.specification;

import com.example.starter_project_2025.system.programminglanguage.entity.ProgrammingLanguage;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * JPA Specification for ProgrammingLanguage queries.
 * 
 * Supports:
 * - Keyword search (searches name and description)
 * - Field-based filtering
 * - Reusable for both preview and export queries
 */
public class ProgrammingLanguageSpecification {

    private ProgrammingLanguageSpecification() {
        // Utility class - prevent instantiation
    }

    /**
     * Creates a specification for searching programming languages.
     *
     * @param keyword Global search term (searches name and description)
     * @param filters Field-specific filters (field name -> value)
     * @return Specification for the query
     */
    public static Specification<ProgrammingLanguage> withFilters(
            String keyword,
            Map<String, String> filters
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Global keyword search (name OR description)
            if (StringUtils.hasText(keyword)) {
                String likePattern = "%" + keyword.toLowerCase() + "%";
                Predicate nameLike = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")), likePattern
                );
                Predicate descriptionLike = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("description")), likePattern
                );
                predicates.add(criteriaBuilder.or(nameLike, descriptionLike));
            }

            // Field-specific filters
            if (filters != null) {
                // Filter by name (exact or contains)
                if (filters.containsKey("name") && StringUtils.hasText(filters.get("name"))) {
                    predicates.add(criteriaBuilder.like(
                            criteriaBuilder.lower(root.get("name")),
                            "%" + filters.get("name").toLowerCase() + "%"
                    ));
                }

                // Filter by version
                if (filters.containsKey("version") && StringUtils.hasText(filters.get("version"))) {
                    predicates.add(criteriaBuilder.like(
                            criteriaBuilder.lower(root.get("version")),
                            "%" + filters.get("version").toLowerCase() + "%"
                    ));
                }

                // Filter by isSupported
                if (filters.containsKey("isSupported") && StringUtils.hasText(filters.get("isSupported"))) {
                    boolean supported = Boolean.parseBoolean(filters.get("isSupported"));
                    predicates.add(criteriaBuilder.equal(root.get("isSupported"), supported));
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Creates a specification for keyword-only search.
     *
     * @param keyword Search term
     * @return Specification for the query
     */
    public static Specification<ProgrammingLanguage> withKeyword(String keyword) {
        return withFilters(keyword, null);
    }
}
