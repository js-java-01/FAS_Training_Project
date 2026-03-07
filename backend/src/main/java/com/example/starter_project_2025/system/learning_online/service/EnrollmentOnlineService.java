package com.example.starter_project_2025.system.learning_online.service;

import com.example.starter_project_2025.system.learning_online.dto.EnrolledCourseOnlineResponse;
import com.example.starter_project_2025.system.learning_online.dto.EnrollmentOnlineRequest;
import com.example.starter_project_2025.system.learning_online.dto.EnrollmentOnlineResponse;

import java.util.List;

public interface EnrollmentOnlineService {

    EnrollmentOnlineResponse enroll(EnrollmentOnlineRequest request);

    List<EnrolledCourseOnlineResponse> getMyEnrolledCourses();
}