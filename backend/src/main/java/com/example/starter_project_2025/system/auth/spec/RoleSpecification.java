package com.example.starter_project_2025.system.auth.spec;

import com.example.starter_project_2025.system.auth.entity.Permission;
import com.example.starter_project_2025.system.auth.entity.Role;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class RoleSpecification {

    private RoleSpecification() {
    }

    public static Specification<Role> isActive(Boolean isActive) {
        return (root, query, cb) -> {
            if (isActive == null) return null;
            return cb.equal(root.get("isActive"), isActive);
        };
    }

    public static Specification<Role> createdAfter(LocalDateTime from) {
        return (root, query, cb) -> {
            if (from == null) return null;
            return cb.greaterThanOrEqualTo(root.get("createdAt"), from);
        };
    }

    public static Specification<Role> createdBefore(LocalDateTime to) {
        return (root, query, cb) -> {
            if (to == null) return null;
            return cb.lessThanOrEqualTo(root.get("createdAt"), to);
        };
    }

    public static Specification<Role> hasPermissionIds(List<UUID> permissionIds) {
        return (root, query, cb) -> {

            if (permissionIds == null || permissionIds.isEmpty()) {
                return null;
            }

            query.distinct(true);

            var permissionJoin = root.join("permissions");

            return permissionJoin.get("id").in(permissionIds);
        };
    }

    public static Specification<Role> hasKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return null;
            }

            String like = "%" + keyword.toLowerCase() + "%";

            return cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("code")), like),
                    cb.like(cb.lower(root.get("description")), like)
            );
        };
    }
}
