package com.example.starter_project_2025.system.topic_mark.controller;

import com.example.starter_project_2025.system.topic_mark.dto.TopicMarkGradebookResponse;
import com.example.starter_project_2025.system.topic_mark.dto.UpdateCommentRequest;
import com.example.starter_project_2025.system.topic_mark.service.TopicMarkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST API for Topic Marks (Gradebook).
 */
@RestController
@RequestMapping("/api/course-classes/{courseClassId}/topic-marks")
@RequiredArgsConstructor
@Tag(name = "Topic Marks (Gradebook)", description = "APIs for managing final gradebook aggregation and student marks in course classes")
@SecurityRequirement(name = "bearerAuth")
public class TopicMarkController {

    private final TopicMarkService topicMarkService;

    /**
     * GET /api/course-classes/{courseClassId}/topic-marks
     * Get gradebook for a course class.
     */
    @GetMapping
    @Operation(
        summary = "Get gradebook for course class",
        description = "Retrieve the complete gradebook including all enrolled students' final scores, pass/fail status, and comments. " +
                      "Only includes ACTIVE enrollments. Final scores are computed based on assessment type weights and grading methods."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Gradebook retrieved successfully",
            content = @Content(schema = @Schema(implementation = TopicMarkGradebookResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Course class not found",
            content = @Content
        )
    })
    public ResponseEntity<TopicMarkGradebookResponse> getGradebook(
            @Parameter(description = "Course class ID", required = true)
            @PathVariable UUID courseClassId
    ) {
        TopicMarkGradebookResponse response = topicMarkService.getGradebook(courseClassId);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/course-classes/{courseClassId}/topic-marks/{userId}/comment
     * Update comment for a student's topic mark.
     */
    @PutMapping("/{userId}/comment")
    @Operation(
        summary = "Update comment for student's topic mark",
        description = "Update or add a comment for a specific student's topic mark in a course class. " +
                      "Creates a new topic mark record if one doesn't exist yet. Does not recalculate scores."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Comment updated successfully"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Course class not found",
            content = @Content
        )
    })
    public ResponseEntity<Void> updateComment(
            @Parameter(description = "Course class ID", required = true)
            @PathVariable UUID courseClassId,
            @Parameter(description = "Student user ID", required = true)
            @PathVariable UUID userId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Comment to set for the student's topic mark",
                required = true,
                content = @Content(schema = @Schema(implementation = UpdateCommentRequest.class))
            )
            @RequestBody UpdateCommentRequest request
    ) {
        topicMarkService.updateComment(courseClassId, userId, request.getComment());
        return ResponseEntity.ok().build();
    }
}
