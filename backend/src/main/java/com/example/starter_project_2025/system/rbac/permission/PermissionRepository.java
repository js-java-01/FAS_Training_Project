package com.example.starter_project_2025.system.rbac.permission;

import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PermissionRepository extends BaseCrudRepository<Permission, UUID> {

    Optional<Permission> findByName(String name);

    List<Permission> findByResource(String resource);

    List<Permission> findByAction(String action);

    Long countByIdIn(Iterable<UUID> ids);

    boolean existsByName(String name);
}
