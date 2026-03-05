package com.example.starter_project_2025.system.course_online.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.starter_project_2025.system.course_online.entity.CourseLessonOnline;

import java.util.List;
import java.util.UUID;

public interface CourseLessonOnlineRepository extends JpaRepository<CourseLessonOnline, UUID> {
    List<CourseLessonOnline> findByCourseIdOrderBySortOrderAsc(UUID courseId);

    boolean existsByCourseIdAndLessonName(UUID courseId, String lessonName);
}