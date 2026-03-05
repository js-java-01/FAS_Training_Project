package com.example.starter_project_2025.system.learning_online.repository;

import com.example.starter_project_2025.system.learning_online.entity.EnrollmentOnline;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EnrollmentOnlineRepository extends JpaRepository<EnrollmentOnline, UUID> {

    boolean existsByUserIdAndCourseOnlineId(UUID userId, UUID courseOnlineId);

    List<EnrollmentOnline> findByUserId(UUID userId);

}
