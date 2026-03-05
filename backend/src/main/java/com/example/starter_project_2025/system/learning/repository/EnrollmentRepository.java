package com.example.starter_project_2025.system.learning.repository;

import com.example.starter_project_2025.system.learning.entity.Enrollment;
import com.example.starter_project_2025.system.learning.enums.EnrollmentStatus;

import io.lettuce.core.dynamic.annotation.Param;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID>, JpaSpecificationExecutor<Enrollment> {
    Optional<Enrollment> findByUserIdAndTrainingClassId(UUID userId, UUID classId);

    List<Enrollment> findByTrainingClassId(UUID classId);

    // List<Enrollment> findByCourseId(UUID courseId);

    // List<Enrollment> findByCourseIdAndStatus(UUID courseId, EnrollmentStatus
    // status);

    // boolean existsByUserIdAndCohortId(UUID userId, UUID cohortId);
    // boolean existsByUserIdAndCourseId(UUID userId, UUID courseId);

    List<Enrollment> findByUserId(UUID userId);

    boolean existsByUserIdAndTrainingClassId(UUID userId, UUID classId);

    @Query("SELECT e FROM Enrollment e " +
            "JOIN FETCH e.user " +
            "JOIN FETCH e.trainingClass " +
            "WHERE e.trainingClass.classCode = :classCode")
    List<Enrollment> findAllByClassCodeWithUser(@Param("classCode") String classCode);

}
