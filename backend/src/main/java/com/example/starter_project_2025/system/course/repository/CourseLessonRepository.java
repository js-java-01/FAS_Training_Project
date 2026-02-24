package com.example.starter_project_2025.system.course.repository;

import com.example.starter_project_2025.system.course.entity.CourseLesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseLessonRepository extends JpaRepository<CourseLesson, UUID> {
    List<CourseLesson> findByCourseIdOrderBySortOrderAsc(UUID courseId);
}