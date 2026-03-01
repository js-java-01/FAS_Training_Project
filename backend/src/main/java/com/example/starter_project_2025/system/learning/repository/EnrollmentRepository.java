package com.example.starter_project_2025.system.learning.repository;

import com.example.starter_project_2025.system.learning.entity.Enrollment;
import com.example.starter_project_2025.system.learning.enums.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {

    List<Enrollment> findByCourseId(UUID courseId);

    List<Enrollment> findByCourseIdAndStatus(UUID courseId, EnrollmentStatus status);

    // boolean existsByUserIdAndCohortId(UUID userId, UUID cohortId);
    boolean existsByUserIdAndCourseId(UUID userId, UUID courseId);

    List<Enrollment> findByUserId(UUID userId);
}
