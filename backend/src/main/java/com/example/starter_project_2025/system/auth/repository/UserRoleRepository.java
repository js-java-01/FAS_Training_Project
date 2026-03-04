package com.example.starter_project_2025.system.auth.repository;

import com.example.starter_project_2025.system.rbac.role.Role;
import com.example.starter_project_2025.system.rbac.user.User;
import com.example.starter_project_2025.system.rbac.user.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRoleRepository extends JpaRepository<UserRole, UUID>
{
    Optional<UserRole> findByUserAndIsDefault(User user, boolean isDefault);

    Optional<UserRole> findByUserAndRole(User user, Role role);
}
