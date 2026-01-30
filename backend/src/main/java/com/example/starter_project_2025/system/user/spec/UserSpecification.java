package com.example.starter_project_2025.system.user.spec;

import com.example.starter_project_2025.system.user.entity.User;
import org.springframework.data.jpa.domain.Specification;
import java.time.LocalDateTime;
import java.util.UUID;

public final class UserSpecification {

    public static Specification<User> hasRoleId(UUID roleId) {
        return (root, query, cb) ->
                roleId == null ? null :
                        cb.equal(root.get("role").get("id"), roleId);
    }

    public static Specification<User> isActive(Boolean isActive) {
        return (root, query, cb) ->
                isActive == null ? null :
                        cb.equal(root.get("isActive"), isActive);
    }

    public static Specification<User> createdAfter(LocalDateTime from) {
        return (root, query, cb) ->
                from == null ? null :
                        cb.greaterThanOrEqualTo(root.get("createdAt"), from);
    }

    public static Specification<User> createdBefore(LocalDateTime to) {
        return (root, query, cb) ->
                to == null ? null :
                        cb.lessThanOrEqualTo(root.get("createdAt"), to);
    }

    public static Specification<User> keyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) return null;

            String like = "%" + keyword.toLowerCase() + "%";

            return cb.or(
                    cb.like(cb.lower(root.get("email")), like),
                    cb.like(cb.lower(root.get("firstName")), like),
                    cb.like(cb.lower(root.get("lastName")), like)
            );
        };
    }
}
