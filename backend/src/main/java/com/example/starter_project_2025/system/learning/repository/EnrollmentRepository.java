package com.example.starter_project_2025.system.learning.repository;

import com.example.starter_project_2025.system.learning.entity.Enrollment;
import com.example.starter_project_2025.system.learning.enums.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {

    List<Enrollment> findByTrainingClassId(UUID trainingClassId);

    List<Enrollment> findByTrainingClassIdAndStatus(UUID trainingClassId, EnrollmentStatus status);

    // boolean existsByUserIdAndCohortId(UUID userId, UUID cohortId);

    // long countByCohortId(UUID cohortId);

    // List<Enrollment> findByUserId(UUID userId);
}
