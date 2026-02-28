package com.example.starter_project_2025.system.auth.repository;

import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRoleRepository extends JpaRepository<UserRole, UUID>
{
    Optional<UserRole> findByUserAndIsDefault(User user, boolean isDefault);

    Optional<UserRole> findByUserAndRole(User user, Role role);
}
