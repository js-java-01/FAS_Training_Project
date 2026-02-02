package com.example.starter_project_2025.system.user.spec;

import com.example.starter_project_2025.system.user.entity.Student;
import com.example.starter_project_2025.system.user.enums.Gender;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;

public final class StudentSpecification {

    private StudentSpecification() {}

    public static Specification<Student> gpaGreaterThanOrEqual(BigDecimal min) {
        return (root, query, cb) ->
                min == null
                        ? null
                        : cb.greaterThanOrEqualTo(root.get("gpa"), min);
    }

    public static Specification<Student> gpaLessThanOrEqual(BigDecimal max) {
        return (root, query, cb) ->
                max == null
                        ? null
                        : cb.lessThanOrEqualTo(root.get("gpa"), max);
    }

    public static Specification<Student> hasGender(Gender gender) {
        return (root, query, cb) ->
                gender == null
                        ? null
                        : cb.equal(root.get("gender"), gender);
    }

    public static Specification<Student> dobAfter(LocalDate from) {
        return (root, query, cb) ->
                from == null
                        ? null
                        : cb.greaterThanOrEqualTo(root.get("dob"), from);
    }

    public static Specification<Student> dobBefore(LocalDate to) {
        return (root, query, cb) ->
                to == null
                        ? null
                        : cb.lessThanOrEqualTo(root.get("dob"), to);
    }

    public static Specification<Student> hasStudentKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) return null;

            String like = "%" + keyword.toLowerCase() + "%";

            return cb.or(
                    cb.like(cb.lower(root.get("studentCode")), like),
                    cb.like(cb.lower(root.get("email")), like),
                    cb.like(cb.lower(root.get("firstName")), like),
                    cb.like(cb.lower(root.get("lastName")), like),
                    cb.like(cb.lower(root.get("phone")), like),
                    cb.like(cb.lower(root.get("address")), like)
            );
        };
    }

}
