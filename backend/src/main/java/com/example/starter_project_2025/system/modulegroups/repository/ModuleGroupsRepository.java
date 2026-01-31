package com.example.starter_project_2025.system.modulegroups.repository;

import com.example.starter_project_2025.system.modulegroups.entity.ModuleGroups;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ModuleGroupsRepository extends JpaRepository<ModuleGroups, UUID> {

    Optional<ModuleGroups> findByName(String name);

    // Lấy các module group active + fetch modules
    @Query("""
                SELECT DISTINCT mg
                FROM ModuleGroups mg
                LEFT JOIN FETCH mg.modules
                WHERE mg.isActive = true
                ORDER BY mg.displayOrder ASC
            """)
    List<ModuleGroups> findActiveModuleGroupsWithModules();

    List<ModuleGroups> findByIsActive(Boolean isActive);

    List<ModuleGroups> findAllByOrderByDisplayOrderAsc();

    boolean existsByName(String name);
}
