package com.example.starter_project_2025.system.modulegroups.repository;

import com.example.starter_project_2025.system.modulegroups.entity.ModuleGroups;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ModuleGroupsRepository extends JpaRepository<ModuleGroups, UUID> {



    List<ModuleGroups> findAllByOrderByDisplayOrderAsc();
    List<ModuleGroups> findAllByNameAndIsActiveTrue(String name);

    @Query("""
    SELECT DISTINCT mg
    FROM ModuleGroups mg
    LEFT JOIN FETCH mg.modules
    ORDER BY mg.displayOrder ASC
""")
    List<ModuleGroups> findAllWithModules();

    boolean existsByName(String name);

    List<ModuleGroups> findByIsActiveTrueOrderByDisplayOrderAsc();


    @Query("""
        SELECT mg FROM ModuleGroups mg
        WHERE
            (:keyword IS NULL OR LOWER(mg.name) LIKE :keyword)
        AND (:isActive IS NULL OR mg.isActive = :isActive)
    """)
    Page<ModuleGroups> search(
            @Param("keyword") String keyword,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );


}
