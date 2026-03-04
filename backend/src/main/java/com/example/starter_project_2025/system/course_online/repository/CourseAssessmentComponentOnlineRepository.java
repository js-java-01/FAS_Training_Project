package com.example.starter_project_2025.system.course_online.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.starter_project_2025.system.course_online.entity.CourseAssessmentComponentOnline;

import java.util.List;
import java.util.UUID;

public interface CourseAssessmentComponentOnlineRepository
        extends JpaRepository<CourseAssessmentComponentOnline, UUID> {

    List<CourseAssessmentComponentOnline>
    findByScheme_CourseIdOrderByDisplayOrder(UUID courseId);
}
