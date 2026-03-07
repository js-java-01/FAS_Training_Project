package com.example.starter_project_2025.system.rbac.role;

import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends BaseCrudRepository<Role, UUID> {

    Optional<Role> findByName(String name);

    Long countByIsActive(Boolean isActive);

    Long countByIdIn(Iterable<UUID> ids);

    @Query("SELECT r FROM Role r LEFT JOIN FETCH r.permissions WHERE r.id = :id")
    Optional<Role> findByIdWithPermissions(@Param("id") UUID id);

    @Query("SELECT r FROM Role r LEFT JOIN FETCH r.permissions WHERE r.isActive = true AND (r.hierarchyLevel = 0 OR r.hierarchyLevel >= :minLevel) ORDER BY r.hierarchyLevel ASC")
    List<Role> findAllActiveWithMinHierarchyLevel(@Param("minLevel") int minLevel);
}
