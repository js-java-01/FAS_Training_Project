package com.example.starter_project_2025.system.course.controller;

import com.example.starter_project_2025.system.course.dto.CourseCreateRequest;
import com.example.starter_project_2025.system.course.dto.CourseResponse;
import com.example.starter_project_2025.system.course.dto.CourseUpdateRequest;
import com.example.starter_project_2025.system.course.service.CourseService;

import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@Tag(name = "Course Management", description = "Course management APIs")
@SecurityRequirement(name = "bearerAuth")
public class CourseController {

    private final CourseService courseService;

    @PostMapping
    @PreAuthorize("hasAuthority('COURSE_CREATE')")
    @Operation(
            summary = "Create course",
            description = "Create a new course"
    )
    public ResponseEntity<CourseResponse> create(
            @RequestBody CourseCreateRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(courseService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('COURSE_UPDATE')")
    @Operation(
            summary = "Update course",
            description = "Update course overview information"
    )
    public ResponseEntity<CourseResponse> update(
            @PathVariable UUID id,
            @RequestBody CourseUpdateRequest request
    ) {
        return ResponseEntity.ok(courseService.update(id, request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('COURSE_READ')")
    @Operation(
            summary = "Get course detail",
            description = "Get course detail by ID"
    )
    public ResponseEntity<CourseResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(courseService.getById(id));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('COURSE_READ')")
    @Operation(
            summary = "Get all courses",
            description = "Get courses with pagination"
    )
    public ResponseEntity<Page<CourseResponse>> getAll(
            @PageableDefault(page = 0, size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(courseService.getAll(pageable));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('COURSE_DELETE')")
    @Operation(
            summary = "Delete course",
            description = "Delete course by ID"
    )
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        courseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}