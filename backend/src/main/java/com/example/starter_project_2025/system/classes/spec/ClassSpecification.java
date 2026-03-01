package com.example.starter_project_2025.system.classes.spec;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;

import com.example.starter_project_2025.system.classes.dto.request.SearchClassRequest;
import com.example.starter_project_2025.system.classes.dto.request.SearchTrainerClassInSemesterRequest;
import com.example.starter_project_2025.system.classes.entity.ClassStatus;
import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.NoArgsConstructor;

@NoArgsConstructor
public class ClassSpecification {

    public static Specification<TrainingClass> filterClasses(SearchClassRequest request) {
        return (root, query, cb) -> {
            String keyword = request.getKeyword();
            Boolean isActive = request.getIsActive();
            String semesterId = request.getSemesterId();
            ClassStatus classStatus = request.getClassStatus();
            if (query.getResultType() != Long.class) {
                root.fetch("creator", JoinType.LEFT);
                root.fetch("approver", JoinType.LEFT);
                root.fetch("semester", JoinType.LEFT);
                root.fetch("courseClasses", JoinType.LEFT).fetch("trainer", JoinType.LEFT);
            }

            String likeKeyword = "%" + (keyword == null ? "" : keyword.toLowerCase()) + "%";
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.isBlank()) {
                Predicate searchByCode = cb.like(cb.lower(root.get("classCode")), likeKeyword);
                Predicate searchByName = cb.like(cb.lower(root.get("className")), likeKeyword);
                Predicate searchByTrainer = cb.like(
                        cb.lower(root.join("courseClasses", JoinType.LEFT)
                                .join("trainer", JoinType.LEFT)
                                .get("fullName")),
                        likeKeyword);
                predicates.add(cb.or(searchByCode, searchByName, searchByTrainer));
                query.distinct(true);

            }

            if (isActive != null) {
                predicates.add(cb.equal(root.get("isActive"), isActive));
            }
            if (semesterId != null && !semesterId.isBlank()) {
                predicates.add(cb.equal(root.get("semester").get("id"), semesterId));
            }

            if (classStatus != null) {
                predicates.add(cb.equal(root.get("classStatus"), classStatus));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<TrainingClass> filterTrainerClasses(UUID trainerId,
            SearchTrainerClassInSemesterRequest request) {
        return (root, query, cb) -> {
            query.distinct(true);
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("semester").get("id"), request.getSemesterId()));

            Join<TrainingClass, CourseClass> courseClassJoin = root.join("courseClasses", JoinType.INNER);
            predicates.add(cb.equal(courseClassJoin.get("trainer").get("id"), trainerId));

            if (request.getKeyword() != null && !request.getKeyword().trim().isEmpty()) {
                String likeKeyword = "%" + request.getKeyword().toLowerCase() + "%";
                Predicate matchName = cb.like(cb.lower(root.get("className")), likeKeyword);
                Predicate matchCode = cb.like(cb.lower(root.get("classCode")), likeKeyword);
                predicates.add(cb.or(matchName, matchCode));
            }

            if (request.getIsActive() != null) {
                predicates.add(cb.equal(root.get("isActive"), request.getIsActive()));
            }

            if (request.getClassStatus() != null) {
                predicates.add(cb.equal(root.get("classStatus"), request.getClassStatus()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}