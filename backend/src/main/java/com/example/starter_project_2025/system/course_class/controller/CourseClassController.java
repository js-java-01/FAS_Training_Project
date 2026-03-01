package com.example.starter_project_2025.system.course_class.controller;

import com.example.starter_project_2025.system.course_class.dto.CourseClassRequest;
import com.example.starter_project_2025.system.course_class.dto.CourseClassResponse;
import com.example.starter_project_2025.system.course_class.service.CourseClassService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import java.util.List;

@RestController
@RequestMapping("/api/course-classes")
@RequiredArgsConstructor
@Tag(name = "Topic Marks (Gradebook)", description = "APIs for managing gradebook columns and student scores in course classes")
@SecurityRequirement(name = "bearerAuth")
public class CourseClassController {

    private final CourseClassService courseClassService;

    /**
     * POST /api/course-classes
     * Link a Course to a TrainingClass (create a CourseClass).
     */
    @PostMapping
    @Operation(
            summary = "Create a course class",
            description = "Links a Course to a TrainingClass. Optionally assigns a trainer. Each Course can only be linked once per TrainingClass."
    )
    @ApiResponse(responseCode = "201", description = "Course class created successfully",
            content = @Content(schema = @Schema(implementation = CourseClassResponse.class)))
    @ApiResponse(responseCode = "400", description = "Course already assigned to this class")
    @ApiResponse(responseCode = "404", description = "Course, TrainingClass or Trainer not found")
    public ResponseEntity<CourseClassResponse> create(@Valid @RequestBody CourseClassRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseClassService.create(request));
    }

    /**
     * GET /api/course-classes
     * Get all course classes.
     */
    @GetMapping
    @Operation(
            summary = "Get all course classes",
            description = "Retrieve a list of all course classes including course info, class info, and trainer info."
    )
    @ApiResponse(
            responseCode = "200",
            description = "List of course classes retrieved successfully",
            content = @Content(schema = @Schema(implementation = CourseClassResponse.class))
    )
    public ResponseEntity<List<CourseClassResponse>> getAll() {
        return ResponseEntity.ok(courseClassService.getAll());
    }

    /**
     * GET /api/course-classes/by-class/{classId}
     * Get all course classes by training class ID.
     */
    @GetMapping("/by-class/{classId}")
    @Operation(
            summary = "Get course classes by class ID",
            description = "Retrieve all course classes associated with a specific training class."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Course classes retrieved successfully",
            content = @Content(schema = @Schema(implementation = CourseClassResponse.class))
    )
    public ResponseEntity<List<CourseClassResponse>> getByClassId(
            @PathVariable UUID classId) {
        return ResponseEntity.ok(courseClassService.getByClassId(classId));
    }

}
