package com.example.starter_project_2025.system.course.repository;

import com.example.starter_project_2025.system.course.entity.CourseCohort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseCohortRepository extends JpaRepository<CourseCohort, UUID> {

    List<CourseCohort> findByCourseId(UUID courseId);

    boolean existsByCode(String code);
}
