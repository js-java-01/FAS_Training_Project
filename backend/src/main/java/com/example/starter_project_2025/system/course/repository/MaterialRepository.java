package com.example.starter_project_2025.system.course.repository;

import com.example.starter_project_2025.system.course.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface MaterialRepository extends JpaRepository<Material, UUID> {
    // Get materials for a session, ordered by display order
    List<Material> findBySessionIdOrderByDisplayOrderAsc(UUID sessionId);

    // Check if material exists for a session
    boolean existsByIdAndSessionId(UUID materialId, UUID sessionId);

    // Get active materials for a session
    List<Material> findBySessionIdAndIsActiveTrueOrderByDisplayOrderAsc(UUID sessionId);
}
