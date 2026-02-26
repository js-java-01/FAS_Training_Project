package com.example.starter_project_2025.system.learning.service;

import com.example.starter_project_2025.system.course.dto.CourseResponse;
import com.example.starter_project_2025.system.learning.dto.EnrollmentRequest;
import com.example.starter_project_2025.system.learning.dto.EnrollmentResponse;

import java.util.List;

public interface EnrollmentService {

    EnrollmentResponse enroll(EnrollmentRequest request);

    List<CourseResponse> getMyEnrolledCourses();
}
