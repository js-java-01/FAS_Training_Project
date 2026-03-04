package com.example.starter_project_2025.system.rbac.role;

import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends BaseCrudRepository<Role, UUID> {

    Optional<Role> findByName(String name);

    Long countByIsActive(Boolean isActive);

    Long countByIdIn(Iterable<UUID> ids);
}
