package com.example.starter_project_2025.system.assessment.spec;

import com.example.starter_project_2025.system.assessment.entity.Question;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class QuestionSpecification {
    public static Specification<Question> filter(
            String keyword,
            UUID categoryId,
            String questionType
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.isBlank()) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("content")),
                                "%" + keyword.toLowerCase() + "%"
                        )
                );
            }

            if (categoryId != null) {
                predicates.add(
                        cb.equal(
                                root.get("category").get("id"),
                                categoryId
                        )
                );
            }

            if (questionType != null) {
                predicates.add(
                        cb.equal(root.get("questionType"), questionType)
                );
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
