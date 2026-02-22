package com.example.starter_project_2025.system.course.repository;

import com.example.starter_project_2025.system.course.entity.CourseObjective;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourseObjectiveRepository
        extends JpaRepository<CourseObjective, UUID> {

    boolean existsByCourseIdAndName(UUID courseId, String name);

    List<CourseObjective> findByCourseId(UUID courseId);
}
