package com.example.starter_project_2025.system.course.repository;

import com.example.starter_project_2025.system.course.entity.CourseAssessmentScheme;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CourseAssessmentSchemeRepository
        extends JpaRepository<CourseAssessmentScheme, UUID> {

    Optional<CourseAssessmentScheme> findByCourseId(UUID courseId);
}