package com.example.starter_project_2025.system.topic.spec;

import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.enums.TopicLevel;
import com.example.starter_project_2025.system.topic.enums.TopicStatus;
import jakarta.persistence.criteria.Predicate;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
public class TopicSpecification
{
    public static Specification<Topic> hasFilters(String keyword, TopicStatus status)
    {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.isBlank())
            {
                String pattern = "%" + keyword.trim().toUpperCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("topicName")), pattern),
                        cb.like(cb.lower(root.get("topicCode")), pattern)
                ));
            }

            if (status != null)
            {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
