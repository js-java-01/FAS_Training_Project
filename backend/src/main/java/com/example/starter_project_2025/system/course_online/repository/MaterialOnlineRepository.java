package com.example.starter_project_2025.system.course_online.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.starter_project_2025.system.course_online.entity.MaterialOnline;

import java.util.List;
import java.util.UUID;

@Repository
public interface MaterialOnlineRepository extends JpaRepository<MaterialOnline, UUID> {
    // Get materials for a session, ordered by display order
    List<MaterialOnline> findBySessionIdOrderByDisplayOrderAsc(UUID sessionId);

    // Check if material exists for a session
    boolean existsByIdAndSessionId(UUID materialId, UUID sessionId);

    // Get active materials for a session
    List<MaterialOnline> findBySessionIdAndIsActiveTrueOrderByDisplayOrderAsc(UUID sessionId);
}
