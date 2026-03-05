package com.example.starter_project_2025.system.user.repository;

import com.example.starter_project_2025.system.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends
        JpaRepository<User, UUID>,
        JpaSpecificationExecutor<User>
{
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByIsActive(Boolean isActive);

    Long countByIsActive(Boolean isActive);

    @Query("SELECT u FROM User u " +
            "LEFT JOIN FETCH u.userRoles ur " +
            "LEFT JOIN FETCH ur.role r " +
            "LEFT JOIN FETCH r.permissions " +
            "WHERE u.email = :email")
    Optional<User> findByEmailWithRoleAndPermissions(@Param("email") String email);
    

    // List<User> findByRoleName(@Param("roleName") String roleName);
}
