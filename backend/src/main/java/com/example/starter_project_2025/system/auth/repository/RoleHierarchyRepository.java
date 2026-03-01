package com.example.starter_project_2025.system.auth.repository;

import com.example.starter_project_2025.system.auth.entity.RoleHierarchy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RoleHierarchyRepository extends JpaRepository<RoleHierarchy, UUID> {

    /** Return all child roles directly under a given parent role */
    @Query("SELECT rh FROM RoleHierarchy rh JOIN FETCH rh.childRole WHERE rh.parentRole.id = :parentId")
    List<RoleHierarchy> findByParentRoleId(@Param("parentId") UUID parentId);

    /** Return all parent roles for a given child role */
    @Query("SELECT rh FROM RoleHierarchy rh JOIN FETCH rh.parentRole WHERE rh.childRole.id = :childId")
    List<RoleHierarchy> findByChildRoleId(@Param("childId") UUID childId);

    boolean existsByParentRoleIdAndChildRoleId(UUID parentRoleId, UUID childRoleId);
}
