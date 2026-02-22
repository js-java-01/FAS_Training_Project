package com.example.starter_project_2025.system.course.controller;

import com.example.starter_project_2025.system.course.dto.CourseObjectiveCreateRequest;
import com.example.starter_project_2025.system.course.dto.CourseObjectiveResponse;
import com.example.starter_project_2025.system.course.service.CourseObjectiveService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses/{courseId}/objectives")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Course Objective Management")
public class CourseObjectiveController {
    private final CourseObjectiveService service;

    @PostMapping
    @PreAuthorize("hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<CourseObjectiveResponse> create(
            @PathVariable UUID courseId,
            @RequestBody CourseObjectiveCreateRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(courseId, request));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('COURSE_READ')")
    public ResponseEntity<List<CourseObjectiveResponse>> getByCourse(
            @PathVariable UUID courseId) {

        return ResponseEntity.ok(service.getByCourse(courseId));
    }
}
