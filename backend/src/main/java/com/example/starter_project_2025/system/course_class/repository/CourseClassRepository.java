package com.example.starter_project_2025.system.course_class.repository;

import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CourseClassRepository extends JpaRepository<CourseClass, UUID> {
}
