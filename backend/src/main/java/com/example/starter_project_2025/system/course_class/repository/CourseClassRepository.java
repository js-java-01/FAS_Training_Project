package com.example.starter_project_2025.system.course_class.repository;

import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseClassRepository extends JpaRepository<CourseClass, UUID>
{
    List<CourseClass> findByTrainer(User user);
}
