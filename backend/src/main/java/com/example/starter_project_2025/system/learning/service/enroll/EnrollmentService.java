package com.example.starter_project_2025.system.learning.service.enroll;

import com.example.starter_project_2025.system.classes.dto.response.TrainingClassSemesterResponse;
import com.example.starter_project_2025.system.course.dto.CourseResponse;
import com.example.starter_project_2025.system.learning.dto.EnrollmentRequest;

import java.util.List;
import java.util.UUID;

public interface EnrollmentService {

    TrainingClassSemesterResponse enroll(EnrollmentRequest request);

    List<CourseResponse> getMyEnrolledCourses();

    String enroll(EnrollmentRequest request, UUID id);
}
