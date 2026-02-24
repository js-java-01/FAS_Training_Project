package com.example.starter_project_2025.system.learning.controller;

import com.example.starter_project_2025.system.learning.dto.EnrollmentRequest;
import com.example.starter_project_2025.system.learning.dto.EnrollmentResponse;
import com.example.starter_project_2025.system.learning.service.EnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ENROLL_COURSE')")
    public EnrollmentResponse
    enroll(@Valid @RequestBody EnrollmentRequest request) {
        return enrollmentService.enroll(request);
    }
}
