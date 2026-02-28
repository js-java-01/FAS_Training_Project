package com.example.starter_project_2025.system.user.spec;

import com.example.starter_project_2025.system.user.entity.User;
import org.springframework.data.jpa.domain.Specification;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class UserSpecification {

    private UserSpecification() {}

    public static Specification<User> hasRoleIds(List<UUID> roleIds) {
        return (root, query, cb) -> {

            if (roleIds == null || roleIds.isEmpty()) {
                return null;
            }

            query.distinct(true);

            var userRoleJoin = root.join("userRoles");
            var roleJoin = userRoleJoin.join("role");

            return roleJoin.get("id").in(roleIds);
        };
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

    public static Specification<User> hasKeyword(String keyword) {
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
