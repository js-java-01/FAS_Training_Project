package com.example.starter_project_2025.system.location.spec;

import com.example.starter_project_2025.system.common.enums.LocationStatus;
import com.example.starter_project_2025.system.location.entity.Location;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public final class LocationSpecifications {

    private LocationSpecifications() {}

    public static Specification<Location> nameLike(String q) {
        return (root, query, cb) -> {
            if (q == null || q.isBlank()) return cb.conjunction();
            return cb.like(
                    cb.lower(root.get("name")),
                    "%" + q.trim().toLowerCase() + "%"
            );
        };
    }

    public static Specification<Location> byCommune(UUID communeId) {
        return (root, query, cb) ->
                communeId == null ? cb.conjunction()
                        : cb.equal(root.get("communeId"), communeId);
    }

    public static Specification<Location> byLocationStatus(LocationStatus status) {
        return (root, query, cb) ->
                status == null ? cb.conjunction()
                        : cb.equal(root.get("status"), status);
    }
}
