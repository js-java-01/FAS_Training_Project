package com.example.starter_project_2025.system.course_assessment_type_weight;

import com.example.starter_project_2025.system.course_assessment_type_weight.dto.CourseWeightRequest;
import com.example.starter_project_2025.system.course_assessment_type_weight.dto.CourseWeightResponse;
import com.example.starter_project_2025.system.course_assessment_type_weight.service.CourseAssessmentTypeWeightService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses/{courseId}/assessment-weights")
@RequiredArgsConstructor
@Tag(name = "Course Assessment Weights", description = "Configure assessment type weights and grading methods per course")
@SecurityRequirement(name = "bearerAuth")
public class CourseAssessmentTypeWeightController {

    private final CourseAssessmentTypeWeightService weightService;

    @GetMapping
    @Operation(
            summary = "Get all assessment weights for a course",
            description = "Returns the list of assessment types configured for this course, " +
                          "along with their weight (e.g. 0.30 = 30%) and grading method (HIGHEST / LATEST / AVERAGE)."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "List retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Course not found", content = @Content)
    })
    public ResponseEntity<List<CourseWeightResponse>> getAll(
            @Parameter(description = "Course ID", required = true) @PathVariable UUID courseId) {
        return ResponseEntity.ok(weightService.getAllByCourse(courseId));
    }

    @PostMapping
    @Operation(
            summary = "Add an assessment type weight to a course",
            description = "Links an AssessmentType to this course and sets its weight and grading method. " +
                          "Each AssessmentType can only be added once per course. " +
                          "Weight is a decimal (e.g. 0.30 = 30%). " +
                          "GradingMethod: HIGHEST=take max score, LATEST=take last column score, AVERAGE=take mean."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Weight created successfully"),
        @ApiResponse(responseCode = "400", description = "Validation error or duplicate AssessmentType", content = @Content),
        @ApiResponse(responseCode = "404", description = "Course or AssessmentType not found", content = @Content)
    })
    public ResponseEntity<CourseWeightResponse> create(
            @Parameter(description = "Course ID", required = true) @PathVariable UUID courseId,
            @Valid @RequestBody CourseWeightRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(weightService.create(courseId, request));
    }

    @PutMapping("/{weightId}")
    @Operation(
            summary = "Update an assessment type weight",
            description = "Updates the weight value, grading method, or even the AssessmentType itself " +
                          "for an existing configuration. Duplicate AssessmentType within the same course is rejected."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Weight updated successfully"),
        @ApiResponse(responseCode = "400", description = "Validation error or duplicate AssessmentType", content = @Content),
        @ApiResponse(responseCode = "404", description = "Course, AssessmentType or weight config not found", content = @Content)
    })
    public ResponseEntity<CourseWeightResponse> update(
            @Parameter(description = "Course ID", required = true) @PathVariable UUID courseId,
            @Parameter(description = "Weight config ID", required = true) @PathVariable UUID weightId,
            @Valid @RequestBody CourseWeightRequest request) {
        return ResponseEntity.ok(weightService.update(courseId, weightId, request));
    }

    @DeleteMapping("/{weightId}")
    @Operation(
            summary = "Remove an assessment type weight from a course",
            description = "Deletes the weight configuration. Note: if existing TopicMarkColumns reference " +
                          "this AssessmentType, removing the weight will cause the final score calculation to fail."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Weight deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Course or weight config not found", content = @Content)
    })
    public ResponseEntity<Void> delete(
            @Parameter(description = "Course ID", required = true) @PathVariable UUID courseId,
            @Parameter(description = "Weight config ID", required = true) @PathVariable UUID weightId) {
        weightService.delete(courseId, weightId);
        return ResponseEntity.noContent().build();
    }
}
