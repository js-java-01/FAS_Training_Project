package com.example.starter_project_2025.system.course_online.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.starter_project_2025.system.course_online.entity.CourseAssessmentSchemeOnline;

import java.util.Optional;
import java.util.UUID;

public interface CourseAssessmentSchemeOnlineRepository
        extends JpaRepository<CourseAssessmentSchemeOnline, UUID> {

    Optional<CourseAssessmentSchemeOnline> findByCourseId(UUID courseId);
}