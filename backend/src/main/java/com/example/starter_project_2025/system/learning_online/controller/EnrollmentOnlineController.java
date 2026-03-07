package com.example.starter_project_2025.system.learning_online.controller;

import com.example.starter_project_2025.system.learning_online.dto.EnrolledCourseOnlineResponse;
import com.example.starter_project_2025.system.learning_online.dto.EnrollmentOnlineRequest;
import com.example.starter_project_2025.system.learning_online.dto.EnrollmentOnlineResponse;
import com.example.starter_project_2025.system.learning_online.service.EnrollmentOnlineService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/online-enrollments")
@RequiredArgsConstructor
public class EnrollmentOnlineController {

    private final EnrollmentOnlineService enrollmentOnlineService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    public EnrollmentOnlineResponse enroll(@Valid @RequestBody EnrollmentOnlineRequest request) {
        return enrollmentOnlineService.enroll(request);
    }

    @GetMapping("/my-courses")
    @PreAuthorize("isAuthenticated()")
    public List<EnrolledCourseOnlineResponse> getMyEnrolledCourses() {
        return enrollmentOnlineService.getMyEnrolledCourses();
    }
}