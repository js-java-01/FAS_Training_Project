package com.example.starter_project_2025.system.course_class.repository;

import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;
import java.util.UUID;

public interface CourseClassRepository extends JpaRepository<CourseClass, UUID>, JpaSpecificationExecutor<CourseClass> {
    List<CourseClass> findByTrainer(User user);

    List<CourseClass> findByClassInfo_Id(UUID classId);

    List<CourseClass> findByCourse_Id(UUID courseId);

    boolean existsByCourse_IdAndClassInfo_Id(UUID courseId, UUID classId);
}
