package com.example.starter_project_2025.system.learning.repository;

import com.example.starter_project_2025.system.learning.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {

    boolean existsByUserIdAndCohortId(UUID userId, UUID cohortId);

    long countByCohortId(UUID cohortId);

    List<Enrollment> findByUserId(UUID userId);
}
