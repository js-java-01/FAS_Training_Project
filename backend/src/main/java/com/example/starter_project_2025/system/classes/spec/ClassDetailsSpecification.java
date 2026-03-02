package com.example.starter_project_2025.system.classes.spec;

import com.example.starter_project_2025.system.classes.dto.request.CourseSearchRequest;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.learning.entity.Enrollment;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@NoArgsConstructor
public class ClassDetailsSpecification
{
    public static Specification<Enrollment> searchTrainees(UUID classId, String keyword)
    {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("trainingClass").get("id"), classId));

            if (keyword != null && !keyword.trim().isEmpty())
            {
                String likeKeyword = "%" + keyword.toLowerCase().trim() + "%";
                Join<Object, Object> userJoin = root.join("user", JoinType.INNER);
                predicates.add(cb.or(
                        cb.like(cb.lower(userJoin.get("email")), likeKeyword),
                        cb.like(cb.lower(userJoin.get("firstName")), likeKeyword),
                        cb.like(cb.lower(userJoin.get("lastName")), likeKeyword)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<CourseClass> searchCourses(UUID classId, CourseSearchRequest request)
    {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("classInfo").get("id"), classId));

            if (request == null)
            {
                return cb.and(predicates.toArray(new Predicate[0]));
            }

            Join<Object, Object> courseJoin = root.join("course", JoinType.INNER);

            if (request.getKeyword() != null && !request.getKeyword().trim().isEmpty())
            {
                String likeKeyword = "%" + request.getKeyword().toLowerCase().trim() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(courseJoin.get("courseName")), likeKeyword),
                        cb.like(cb.lower(courseJoin.get("courseCode")), likeKeyword),
                        cb.like(cb.lower(courseJoin.get("description")), likeKeyword),
                        cb.like(cb.lower(courseJoin.get("note")), likeKeyword)
                ));
            }

            if (request.getLevel() != null)
            {
                predicates.add(cb.equal(courseJoin.get("level"), request.getLevel()));
            }

            if (request.getMinGpa() != null)
            {
                predicates.add(cb.greaterThanOrEqualTo(courseJoin.get("minGpaToPass"), request.getMinGpa()));
            }

            if (request.getAllowFinalRetake() != null)
            {
                predicates.add(cb.equal(courseJoin.get("allowFinalRetake"), request.getAllowFinalRetake()));
            }

            if (request.getStartDate() != null || request.getEndDate() != null)
            {
                Join<Object, Object> classInfoJoin = root.join("classInfo", JoinType.INNER);

                if (request.getStartDate() != null)
                {
                    predicates.add(cb.greaterThanOrEqualTo(
                            classInfoJoin.get("startDate"),
                            request.getStartDate().atStartOfDay()
                    ));
                }

                if (request.getEndDate() != null)
                {
                    predicates.add(cb.lessThanOrEqualTo(
                            classInfoJoin.get("endDate"),
                            request.getEndDate().atTime(23, 59, 59)
                    ));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
