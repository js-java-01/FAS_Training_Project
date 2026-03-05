package com.example.starter_project_2025.system.course_online.feedback;

import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CourseOnlineFeedbackRepository extends BaseCrudRepository<CourseOnlineFeedback, UUID> {
    
    // Kiểm tra xem User này đã review Course này chưa
    boolean existsByCourseOnlineIdAndStudentId(UUID courseOnlineId, UUID studentId);
}