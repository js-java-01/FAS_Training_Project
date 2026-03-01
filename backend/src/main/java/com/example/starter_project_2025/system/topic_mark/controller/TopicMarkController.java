package com.example.starter_project_2025.system.topic_mark.controller;

import com.example.starter_project_2025.system.modulegroups.dto.response.ImportResultResponse;
import com.example.starter_project_2025.system.topic_mark.dto.*;
import com.example.starter_project_2025.system.topic_mark.service.TopicMarkService;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springdoc.core.annotations.ParameterObject;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * REST API for Topic Marks (Gradebook) and Column Management.
 *
 * <pre>
 * Gradebook:
 *   GET    /api/course-classes/{courseClassId}/topic-marks                → full gradebook
 *   GET    /api/course-classes/{courseClassId}/topic-marks/search         → paginated search
 *   GET    /api/course-classes/{courseClassId}/topic-marks/{userId}       → student detail
 *   PUT    /api/course-classes/{courseClassId}/topic-marks/{userId}       → update scores
 *   GET    /api/course-classes/{courseClassId}/topic-marks/history        → score change history
 *
 * Import / Export:
 *   GET    /api/course-classes/{courseClassId}/topic-marks/export          → export gradebook (scores)
 *   GET    /api/course-classes/{courseClassId}/topic-marks/export/template → download template
 *   POST   /api/course-classes/{courseClassId}/topic-marks/import          → import scores
 *
 * Column management:
 *   POST   /api/course-classes/{courseClassId}/topic-mark-columns             → add column
 *   PUT    /api/course-classes/{courseClassId}/topic-mark-columns/{columnId}  → rename column
 *   DELETE /api/course-classes/{courseClassId}/topic-mark-columns/{columnId}  → remove column
 * </pre>
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Topic Marks (Gradebook)", description = "APIs for managing gradebook columns and student scores in course classes")
@SecurityRequirement(name = "bearerAuth")
public class TopicMarkController {

    private final TopicMarkService topicMarkService;
    private final UserRepository userRepository;

    @GetMapping("/api/course-classes/{courseClassId}/topic-marks")
    @Operation(summary = "Get full gradebook for a course class",
               description = "Returns all active column definitions and one row per enrolled student with their current scores, final score, and pass/fail status.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Gradebook retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "CourseClass not found", content = @Content)
    })
    public ResponseEntity<TopicMarkGradebookResponse> getGradebook(
            @Parameter(description = "Course class ID", required = true)
            @PathVariable UUID courseClassId) {
        return ResponseEntity.ok(topicMarkService.getGradebook(courseClassId));
    }

    @GetMapping("/api/course-classes/{courseClassId}/topic-marks/search")
    @Operation(summary = "Search gradebook by student name (paginated)",
               description = "Filters enrolled students by full name (case-insensitive, partial match). " +
                             "Returns column definitions once + paginated student rows. " +
                             "Supports ?keyword=john&page=0&size=10&sort=fullName,asc")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Gradebook search result retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "CourseClass not found", content = @Content)
    })
    public ResponseEntity<com.example.starter_project_2025.system.modulegroups.dto.response.ApiResponse<TopicMarkGradebookSearchResponse>> searchGradebook(
            @Parameter(description = "Course class ID", required = true) @PathVariable UUID courseClassId,
            @Parameter(description = "Student name to search (partial, case-insensitive)") @RequestParam(required = false) String keyword,
            @Parameter(description = "Filter by pass/fail status (true = passed, false = failed, omit = all)") @RequestParam(required = false) Boolean passed,
            @ParameterObject Pageable pageable) {
        TopicMarkGradebookSearchResponse result = topicMarkService.searchGradebook(courseClassId, keyword, passed, pageable);
        return ResponseEntity.ok(com.example.starter_project_2025.system.modulegroups.dto.response.ApiResponse.success(result, "Gradebook retrieved successfully"));
    }

    @GetMapping("/api/course-classes/{courseClassId}/topic-marks/{userId}")
    @Operation(summary = "Get detailed scores for a single student",
               description = "Returns per-section scores (with grading method applied), individual column scores, and full audit history.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Detail retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "CourseClass or User not found", content = @Content)
    })
    public ResponseEntity<TopicMarkDetailResponse> getStudentDetail(
            @Parameter(description = "Course class ID", required = true) @PathVariable UUID courseClassId,
            @Parameter(description = "Student user ID", required = true) @PathVariable UUID userId) {
        return ResponseEntity.ok(topicMarkService.getStudentDetail(courseClassId, userId));
    }

    @PutMapping("/api/course-classes/{courseClassId}/topic-marks/{userId}")
    @Operation(summary = "Save / update scores for a student",
               description = "Updates one or more column scores for a student. " +
                             "A reason is required for audit trail. " +
                             "If all columns are filled after saving, the final score is automatically computed.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Scores saved successfully"),
        @ApiResponse(responseCode = "400", description = "Validation error (score out of range, deleted column, etc.)", content = @Content),
        @ApiResponse(responseCode = "404", description = "CourseClass, User or Column not found", content = @Content)
    })
    public ResponseEntity<TopicMarkDetailResponse> updateScores(
            @Parameter(description = "Course class ID", required = true) @PathVariable UUID courseClassId,
            @Parameter(description = "Student user ID", required = true) @PathVariable UUID userId,
            @Valid @RequestBody UpdateTopicMarkRequest request,
            Authentication authentication) {
        UUID editorId = resolveCurrentUserId(authentication);
        return ResponseEntity.ok(topicMarkService.updateScores(courseClassId, userId, request, editorId));
    }

    @GetMapping("/api/course-classes/{courseClassId}/topic-marks/history")
    @Operation(
            summary = "Get score change history for a course class",
            description = "Returns a paginated list of all score change records for the course class. " +
                          "Default sort is updatedAt,desc. Supports ?page=0&size=10&sort=updatedAt,desc")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "History retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "CourseClass not found", content = @Content)
    })
    public ResponseEntity<ScoreHistoryResponse> getScoreHistory(
            @Parameter(description = "Course class ID", required = true) @PathVariable UUID courseClassId,
            @ParameterObject Pageable pageable) {
        return ResponseEntity.ok(topicMarkService.getScoreHistory(courseClassId, pageable));
    }

    @GetMapping("/api/course-classes/{courseClassId}/topic-marks/export")
    @Operation(
            summary = "Export full gradebook with scores",
            description = "Returns an Excel (.xlsx) file with all entered scores, final scores, and PASS/FAIL status for every enrolled student.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Gradebook exported"),
        @ApiResponse(responseCode = "404", description = "CourseClass not found", content = @Content)
    })
    public ResponseEntity<byte[]> exportGradebook(
            @Parameter(description = "Course class ID", required = true) @PathVariable UUID courseClassId) {
        return topicMarkService.exportGradebook(courseClassId);
    }

    @GetMapping("/api/course-classes/{courseClassId}/topic-marks/export/template")
    @Operation(
            summary = "Download gradebook score-entry template",
            description = "Returns an Excel (.xlsx) file with:\n" +
                          "- Row 0 (hidden): machine-readable column UUIDs for import matching\n" +
                          "- Row 1: visible header (STT | Họ và tên | Email | <column labels…>)\n" +
                          "- Row 2+: one row per enrolled student, score cells empty (ready to fill)\n\n" +
                          "Teacher downloads → fills scores offline → uploads via POST /import.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Template file generated"),
        @ApiResponse(responseCode = "404", description = "CourseClass not found", content = @Content)
    })
    public ResponseEntity<byte[]> exportGradebookTemplate(
            @Parameter(description = "Course class ID", required = true) @PathVariable UUID courseClassId) {
        return topicMarkService.exportGradebookTemplate(courseClassId);
    }

    @PostMapping(value = "/api/course-classes/{courseClassId}/topic-marks/import", consumes = "multipart/form-data")
    @Operation(
            summary = "Import gradebook scores from Excel",
            description = "Accepts a filled Excel template (.xlsx).\n" +
                          "- Row 0 (meta): column UUIDs for matching\n" +
                          "- Column 1 (hidden): user UUID for matching\n" +
                          "- Blank cells = keep existing score, filled cells = update\n" +
                          "- Final scores are auto-recomputed after import")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Import completed (all rows succeeded)"),
        @ApiResponse(responseCode = "400", description = "Import completed with some failures"),
        @ApiResponse(responseCode = "404", description = "CourseClass not found", content = @Content)
    })
    public ResponseEntity<ImportResultResponse> importGradebook(
            @Parameter(description = "Course class ID", required = true) @PathVariable UUID courseClassId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        UUID editorId = resolveCurrentUserId(authentication);
        ImportResultResponse response = topicMarkService.importGradebook(courseClassId, file, editorId);
        if (response.getFailedCount() > 0) {
            response.setMessage("Import completed. Some rows failed.");
            return ResponseEntity.badRequest().body(response);
        }
        response.setMessage("Import gradebook scores successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/course-classes/{courseClassId}/topic-mark-columns")
    @Operation(summary = "Add a new gradebook column",
               description = "Creates a new column under the specified AssessmentType for this course class. " +
                             "Automatically creates null-score entries for all currently enrolled students. " +
                             "The AssessmentType must already have a weight configured for the course.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Column created successfully"),
        @ApiResponse(responseCode = "400", description = "No weight configured for the AssessmentType", content = @Content),
        @ApiResponse(responseCode = "404", description = "CourseClass or AssessmentType not found", content = @Content)
    })
    public ResponseEntity<TopicMarkColumnResponse> addColumn(
            @Parameter(description = "Course class ID", required = true) @PathVariable UUID courseClassId,
            @Valid @RequestBody TopicMarkColumnRequest request,
            Authentication authentication) {
        UUID editorId = resolveCurrentUserId(authentication);
        TopicMarkColumnResponse response = topicMarkService.addColumn(courseClassId, request, editorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/api/course-classes/{courseClassId}/topic-mark-columns/{columnId}")
    @Operation(summary = "Rename a gradebook column",
               description = "Updates the display label of a column. Always allowed, even if entries already exist.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Column label updated"),
        @ApiResponse(responseCode = "404", description = "Column not found", content = @Content)
    })
    public ResponseEntity<TopicMarkColumnResponse> updateColumnLabel(
            @Parameter(description = "Course class ID", required = true) @PathVariable UUID courseClassId,
            @Parameter(description = "Column ID", required = true) @PathVariable UUID columnId,
            @Parameter(description = "New label", required = true) @RequestParam String newLabel,
            Authentication authentication) {
        UUID editorId = resolveCurrentUserId(authentication);
        return ResponseEntity.ok(topicMarkService.updateColumnLabel(courseClassId, columnId, newLabel, editorId));
    }

    @DeleteMapping("/api/course-classes/{courseClassId}/topic-mark-columns/{columnId}")
    @Operation(summary = "Delete a gradebook column",
               description = "Soft-deletes the column. Only allowed if NO student has a non-null score on this column.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Column deleted"),
        @ApiResponse(responseCode = "409", description = "Column has scores entered and cannot be deleted", content = @Content),
        @ApiResponse(responseCode = "404", description = "Column not found", content = @Content)
    })
    public ResponseEntity<Void> deleteColumn(
            @Parameter(description = "Course class ID", required = true) @PathVariable UUID courseClassId,
            @Parameter(description = "Column ID", required = true) @PathVariable UUID columnId) {
        topicMarkService.deleteColumn(courseClassId, columnId);
        return ResponseEntity.noContent().build();
    }

    /** Resolve the currently authenticated user's UUID from the security context. */
    private UUID resolveCurrentUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalStateException("No authenticated user found in security context");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found: " + authentication.getName()))
                .getId();
    }
}
