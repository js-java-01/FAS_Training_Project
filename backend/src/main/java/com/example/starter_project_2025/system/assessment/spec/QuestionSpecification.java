package com.example.starter_project_2025.system.assessment.spec;

import com.example.starter_project_2025.system.assessment.entity.Question;
import com.example.starter_project_2025.system.assessment.entity.Tag;
import jakarta.persistence.criteria.Join;
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
            String questionType,
            List<Long> tagIds
    ) {
        return (root, query, cb) -> {

            query.distinct(true);

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
                        cb.equal(root.get("category").get("id"), categoryId)
                );
            }

            if (questionType != null && !questionType.isBlank()) {
                predicates.add(
                        cb.equal(root.get("questionType"), questionType)
                );
            }

            if (tagIds != null && !tagIds.isEmpty()) {
                Join<Question, Tag> tagJoin = root.join("tags");
                predicates.add(tagJoin.get("id").in(tagIds));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
