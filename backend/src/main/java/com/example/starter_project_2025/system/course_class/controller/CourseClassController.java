package com.example.starter_project_2025.system.course_class.controller;

import com.example.starter_project_2025.system.course_class.dto.CourseClassResponse;
import com.example.starter_project_2025.system.course_class.service.CourseClassService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
