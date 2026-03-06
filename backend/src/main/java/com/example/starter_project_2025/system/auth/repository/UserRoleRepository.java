package com.example.starter_project_2025.system.auth.repository;

import com.example.starter_project_2025.system.rbac.role.Role;
import com.example.starter_project_2025.system.rbac.user.User;
import com.example.starter_project_2025.system.rbac.user.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRoleRepository extends JpaRepository<UserRole, UUID> {
    Optional<UserRole> findByUserAndIsDefault(User user, boolean isDefault);

    Optional<UserRole> findByUserAndRole(User user, Role role);

    /**
     * Returns all roles assigned to a user (eager-fetches the Role + its
     * permissions).
     */
    @Query("SELECT ur FROM UserRole ur JOIN FETCH ur.role r LEFT JOIN FETCH r.permissions WHERE ur.user.id = :userId")
    List<UserRole> findByUserIdWithPermissions(@Param("userId") UUID userId);
}
