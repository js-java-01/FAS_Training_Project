package com.example.starter_project_2025.system.auth.repository;

import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import com.example.starter_project_2025.system.auth.entity.Role;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleCrudRepository extends BaseCrudRepository<Role, UUID> {

    Optional<Role> findByName(String name);

    Long countByIsActive(Boolean isActive);

    Long countByIdIn(Iterable<UUID> ids);
}
