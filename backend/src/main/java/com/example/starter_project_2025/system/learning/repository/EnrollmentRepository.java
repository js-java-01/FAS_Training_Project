package com.example.starter_project_2025.system.learning.repository;

import com.example.starter_project_2025.system.learning.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID>, JpaSpecificationExecutor<Enrollment>
{
    Optional<Enrollment> findByUserIdAndTrainingClassId(UUID userId, UUID classId);

}