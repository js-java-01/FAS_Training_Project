package com.example.starter_project_2025.system.modulegroups.repository;

import com.example.starter_project_2025.system.modulegroups.entity.Module;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ModuleRepository extends JpaRepository<Module, UUID> {

    List<Module> findByModuleGroupIdOrderByDisplayOrderAsc(UUID moduleGroupId);

    boolean existsByModuleGroupIdAndTitle(UUID moduleGroupId, String title);

    // Kiểm tra URL đã tồn tại chưa (dùng cho Create)
    boolean existsByUrl(String url);

    // Kiểm tra URL đã tồn tại ở record KHÁC id hiện tại chưa (dùng cho Update)
    boolean existsByUrlAndIdNot(String url, UUID id);

    List<Module> findByIsActive(Boolean isActive);

    @Query("""
    SELECT m
    FROM Module m
    WHERE (:keyword IS NULL OR
          LOWER(m.title) LIKE :keyword OR
          LOWER(m.url) LIKE :keyword)
      AND (:moduleGroupId IS NULL OR m.moduleGroup.id = :moduleGroupId)
      AND (:isActive IS NULL OR m.isActive = :isActive)
""")
    Page<Module> search(
            @Param("keyword") String keyword,
            @Param("moduleGroupId") UUID moduleGroupId,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );
}
