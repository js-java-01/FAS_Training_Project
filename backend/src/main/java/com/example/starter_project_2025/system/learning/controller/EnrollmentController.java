package com.example.starter_project_2025.system.learning.controller;

import com.example.starter_project_2025.security.UserDetailsImpl;
import com.example.starter_project_2025.system.learning.dto.EnrollmentRequest;
import com.example.starter_project_2025.system.learning.service.enroll.EnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("")
    public ResponseEntity<String> enroll(@Valid @RequestBody EnrollmentRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        String result = enrollmentService.enroll(request, userDetails.getId());
        return ResponseEntity.ok(result);
    }

}
