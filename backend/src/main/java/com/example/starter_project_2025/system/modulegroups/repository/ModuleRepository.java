package com.example.starter_project_2025.system.modulegroups.repository;

import com.example.starter_project_2025.system.modulegroups.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ModuleRepository extends JpaRepository<Module, UUID> {

    List<Module> findByModuleGroupIdOrderByDisplayOrderAsc(UUID moduleGroupId);

    List<Module> findByParentIdOrderByDisplayOrderAsc(UUID parentId);

    List<Module> findByIsActive(Boolean isActive);

    @Query("""
                SELECT m
                FROM Module m
                WHERE m.moduleGroup.id = :moduleGroupId
                  AND m.parent IS NULL
                ORDER BY m.displayOrder
            """)
    List<Module> findRootModulesByModuleGroupId(
            @Param("moduleGroupId") UUID moduleGroupId
    );

    boolean existsByModuleGroupIdAndTitle(UUID moduleGroupId, String title);

}
