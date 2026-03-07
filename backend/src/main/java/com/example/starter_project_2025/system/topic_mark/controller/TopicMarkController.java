package com.example.starter_project_2025.system.topic_mark.controller;

import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.modulegroups.dto.response.ImportResultResponse;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.course_class.repository.CourseClassRepository;
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

import java.util.List;
import java.util.UUID;

/**
 * REST API for Topic Marks (Gradebook) and Column Management.
 *
 * <pre>
 * Gradebook:
 *   GET    /api/training-programs/{trainingProgramId}/topic-marks                → full gradebook
 *   GET    /api/training-programs/{trainingProgramId}/topic-marks/search         → paginated search
 *   GET    /api/training-programs/{trainingProgramId}/topic-marks/{userId}       → student detail
 *   PUT    /api/training-programs/{trainingProgramId}/topic-marks/{userId}       → update scores
 *   GET    /api/training-programs/{trainingProgramId}/topic-marks/history        → score change history
 *
 * Import / Export:
 *   GET    /api/training-programs/{trainingProgramId}/topic-marks/export          → export gradebook (scores)
 *   GET    /api/training-programs/{trainingProgramId}/topic-marks/export/template → download template
 *   POST   /api/training-programs/{trainingProgramId}/topic-marks/import          → import scores
 *
 * Column management:
 *   POST   /api/training-programs/{trainingProgramId}/topic-mark-columns             → add column
 *   PUT    /api/training-programs/{trainingProgramId}/topic-mark-columns/{columnId}  → rename column
 *   DELETE /api/training-programs/{trainingProgramId}/topic-mark-columns/{columnId}  → remove column
 * </pre>
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Topic Marks (Gradebook)", description = "APIs for managing gradebook columns and scores by training program (resolved to active/latest course class)")
@SecurityRequirement(name = "bearerAuth")
public class TopicMarkController {

    private final TopicMarkService topicMarkService;
    private final CourseClassRepository courseClassRepository;

    @Schema(name = "TopicMarkImportRequest", description = "Multipart payload for gradebook import")
    static class TopicMarkImportRequest {
        @Schema(description = "Excel file (.xlsx)", type = "string", format = "binary", requiredMode = Schema.RequiredMode.REQUIRED)
        public MultipartFile file;
    }
    private final UserRepository userRepository;

    @GetMapping("/api/training-programs/{trainingProgramId}/topic-marks")
    @Operation(summary = "Get gradebook by training program",
               description = "Returns active score columns and one row per enrolled student with column scores, final score, and pass/fail status. " +
                             "The system resolves one target course class from the given training program (active first, otherwise latest updated). " +
                             "Final score is derived from topic assessment-type weights distributed by number of columns per assessment type.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Gradebook retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Training program not found or no mapped course class", content = @Content)
    })
    public ResponseEntity<TopicMarkGradebookResponse> getGradebook(
            @Parameter(description = "Training program ID", required = true)
            @PathVariable UUID trainingProgramId) {
        UUID courseClassId = resolveCourseClassId(trainingProgramId);
        return ResponseEntity.ok(topicMarkService.getGradebook(courseClassId));
    }

    @GetMapping("/api/training-programs/{trainingProgramId}/topic-marks/search")
    @Operation(summary = "Search gradebook rows (paginated)",
               description = "Filters enrolled students by name or email (case-insensitive, partial match). " +
                             "Returns column definitions once + paginated student rows. " +
                             "Supports ?keyword=john&page=0&size=10&sort=fullName,asc")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Gradebook search result retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Training program not found or no mapped course class", content = @Content)
    })
    public ResponseEntity<com.example.starter_project_2025.system.modulegroups.dto.response.ApiResponse<TopicMarkGradebookSearchResponse>> searchGradebook(
            @Parameter(description = "Training program ID", required = true) @PathVariable UUID trainingProgramId,
            @Parameter(description = "Student name or email to search (partial, case-insensitive)") @RequestParam(required = false) String keyword,
            @Parameter(description = "Filter by pass/fail status (true = passed, false = failed, omit = all)") @RequestParam(required = false) Boolean passed,
            @ParameterObject Pageable pageable) {
        UUID courseClassId = resolveCourseClassId(trainingProgramId);
        TopicMarkGradebookSearchResponse result = topicMarkService.searchGradebook(courseClassId, keyword, passed, pageable);
        return ResponseEntity.ok(com.example.starter_project_2025.system.modulegroups.dto.response.ApiResponse.success(result, "Gradebook retrieved successfully"));
    }

    @GetMapping("/api/training-programs/{trainingProgramId}/topic-marks/{userId}")
    @Operation(summary = "Get student score detail",
               description = "Returns per-assessment-type sections, individual column scores, and full audit history for one student.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Detail retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Training program, mapped course class, or user not found", content = @Content)
    })
    public ResponseEntity<TopicMarkDetailResponse> getStudentDetail(
            @Parameter(description = "Training program ID", required = true) @PathVariable UUID trainingProgramId,
            @Parameter(description = "Student user ID", required = true) @PathVariable UUID userId) {
        UUID courseClassId = resolveCourseClassId(trainingProgramId);
        return ResponseEntity.ok(topicMarkService.getStudentDetail(courseClassId, userId));
    }

    @PutMapping("/api/training-programs/{trainingProgramId}/topic-marks/{userId}")
    @Operation(summary = "Update student scores",
               description = "Updates one or more column scores for a student. " +
                             "A reason is required for audit trail. " +
                             "If all active columns have scores and all assessment types have topic weights, final score is auto-computed.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Scores saved successfully"),
        @ApiResponse(responseCode = "400", description = "Validation error (score out of range, deleted column, etc.)", content = @Content),
        @ApiResponse(responseCode = "404", description = "Training program, mapped course class, user, or column not found", content = @Content)
    })
    public ResponseEntity<TopicMarkDetailResponse> updateScores(
            @Parameter(description = "Training program ID", required = true) @PathVariable UUID trainingProgramId,
            @Parameter(description = "Student user ID", required = true) @PathVariable UUID userId,
            @Valid @RequestBody UpdateTopicMarkRequest request,
            Authentication authentication) {
        UUID courseClassId = resolveCourseClassId(trainingProgramId);
        UUID editorId = resolveCurrentUserId(authentication);
        return ResponseEntity.ok(topicMarkService.updateScores(courseClassId, userId, request, editorId));
    }

    @GetMapping("/api/training-programs/{trainingProgramId}/topic-marks/history")
    @Operation(
            summary = "Get score change history",
            description = "Returns a paginated list of all score change records for the resolved course class of the training program. " +
                          "Default sort is updatedAt,desc. Supports ?page=0&size=10&sort=updatedAt,desc")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "History retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Training program not found or no mapped course class", content = @Content)
    })
    public ResponseEntity<ScoreHistoryResponse> getScoreHistory(
            @Parameter(description = "Training program ID", required = true) @PathVariable UUID trainingProgramId,
            @ParameterObject Pageable pageable) {
        UUID courseClassId = resolveCourseClassId(trainingProgramId);
        return ResponseEntity.ok(topicMarkService.getScoreHistory(courseClassId, pageable));
    }

    @GetMapping("/api/training-programs/{trainingProgramId}/topic-marks/export")
    @Operation(
            summary = "Export full gradebook with scores",
            description = "Returns an Excel (.xlsx) file with all entered scores, final scores, and PASS/FAIL status for every enrolled student in the resolved course class.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Gradebook exported"),
        @ApiResponse(responseCode = "404", description = "Training program not found or no mapped course class", content = @Content)
    })
    public ResponseEntity<byte[]> exportGradebook(
            @Parameter(description = "Training program ID", required = true) @PathVariable UUID trainingProgramId) {
        UUID courseClassId = resolveCourseClassId(trainingProgramId);
        return topicMarkService.exportGradebook(courseClassId);
    }

    @GetMapping("/api/training-programs/{trainingProgramId}/topic-marks/export/template")
    @Operation(
            summary = "Download gradebook score-entry template",
            description = "Returns an Excel (.xlsx) file with:\n" +
                          "- Row 0 (hidden): machine-readable column UUIDs for import matching\n" +
                          "- Row 1: visible header (STT | Họ và tên | Email | <column labels…>)\n" +
                          "- Row 2+: one row per enrolled student, score cells empty (ready to fill)\n\n" +
                          "Teacher downloads → fills scores offline → uploads via POST /import.\n" +
                          "Template is generated from the resolved course class of the training program.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Template file generated"),
        @ApiResponse(responseCode = "404", description = "Training program not found or no mapped course class", content = @Content)
    })
    public ResponseEntity<byte[]> exportGradebookTemplate(
            @Parameter(description = "Training program ID", required = true) @PathVariable UUID trainingProgramId) {
        UUID courseClassId = resolveCourseClassId(trainingProgramId);
        return topicMarkService.exportGradebookTemplate(courseClassId);
    }

    @PostMapping(value = "/api/training-programs/{trainingProgramId}/topic-marks/import", consumes = "multipart/form-data")
    @Operation(
            summary = "Import gradebook scores from Excel",
            description = "Accepts a filled Excel template (.xlsx).\n" +
                          "- Row 0 (meta): column UUIDs for matching\n" +
                          "- Column 1 (hidden): user UUID for matching\n" +
                          "- Blank cells = keep existing score, filled cells = update\n" +
                  "- Final scores are auto-recomputed after import using topic assessment-type weights distributed by number of columns",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                required = true,
                content = @Content(
                    mediaType = "multipart/form-data",
                    schema = @Schema(implementation = TopicMarkImportRequest.class))))
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Import processed"),
        @ApiResponse(responseCode = "400", description = "Import failed (validation or row errors)"),
        @ApiResponse(responseCode = "404", description = "Training program not found or no mapped course class", content = @Content)
    })
    public ResponseEntity<ImportResultResponse> importGradebook(
            @Parameter(description = "Training program ID", required = true) @PathVariable UUID trainingProgramId,
            @Parameter(description = "Excel file (.xlsx)", required = true) 
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        UUID courseClassId = resolveCourseClassId(trainingProgramId);
        UUID editorId = resolveCurrentUserId(authentication);
        ImportResultResponse response = topicMarkService.importGradebook(courseClassId, file, editorId);
        if (response.getMessage() == null || response.getMessage().isBlank()) {
            if (response.getFailedCount() > 0) {
                response.setMessage("Import completed with some failed rows. Please review errors.");
            } else {
                response.setMessage("Import gradebook scores successfully");
            }
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/training-programs/{trainingProgramId}/topic-mark-columns")
    @Operation(summary = "Add a new gradebook column",
               description = "Creates a new column under the specified AssessmentType for the resolved course class. " +
                             "Automatically creates null-score entries for all currently enrolled students. " +
                             "Final-score computation requires topic assessment-type weights to exist for this course's topic.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Column created successfully"),
        @ApiResponse(responseCode = "400", description = "No weight configured for the AssessmentType", content = @Content),
        @ApiResponse(responseCode = "404", description = "Training program, mapped course class, or AssessmentType not found", content = @Content)
    })
    public ResponseEntity<TopicMarkColumnResponse> addColumn(
            @Parameter(description = "Training program ID", required = true) @PathVariable UUID trainingProgramId,
            @Valid @RequestBody TopicMarkColumnRequest request,
            Authentication authentication) {
        UUID courseClassId = resolveCourseClassId(trainingProgramId);
        UUID editorId = resolveCurrentUserId(authentication);
        TopicMarkColumnResponse response = topicMarkService.addColumn(courseClassId, request, editorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/api/training-programs/{trainingProgramId}/topic-mark-columns/{columnId}")
    @Operation(summary = "Rename gradebook column",
               description = "Updates the display label of a column. Always allowed, even if entries already exist.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Column label updated"),
        @ApiResponse(responseCode = "404", description = "Column not found", content = @Content)
    })
    public ResponseEntity<TopicMarkColumnResponse> updateColumnLabel(
            @Parameter(description = "Training program ID", required = true) @PathVariable UUID trainingProgramId,
            @Parameter(description = "Column ID", required = true) @PathVariable UUID columnId,
            @Parameter(description = "New label", required = true) @RequestParam String newLabel,
            Authentication authentication) {
        UUID courseClassId = resolveCourseClassId(trainingProgramId);
        UUID editorId = resolveCurrentUserId(authentication);
        return ResponseEntity.ok(topicMarkService.updateColumnLabel(courseClassId, columnId, newLabel, editorId));
    }

    @DeleteMapping("/api/training-programs/{trainingProgramId}/topic-mark-columns/{columnId}")
    @Operation(summary = "Delete gradebook column",
               description = "Soft-deletes the column. Only allowed if NO student has a non-null score on this column.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Column deleted"),
        @ApiResponse(responseCode = "409", description = "Column has scores entered and cannot be deleted", content = @Content),
        @ApiResponse(responseCode = "404", description = "Column not found", content = @Content)
    })
    public ResponseEntity<Void> deleteColumn(
            @Parameter(description = "Training program ID", required = true) @PathVariable UUID trainingProgramId,
            @Parameter(description = "Column ID", required = true) @PathVariable UUID columnId) {
        UUID courseClassId = resolveCourseClassId(trainingProgramId);
        topicMarkService.deleteColumn(courseClassId, columnId);
        return ResponseEntity.noContent().build();
    }

    private UUID resolveCourseClassId(UUID trainingProgramId) {
        List<CourseClass> activeCourseClasses = courseClassRepository
                .findByClassInfo_TrainingProgram_IdAndClassInfo_IsActiveTrueOrderByUpdatedDateDesc(trainingProgramId);
        if (!activeCourseClasses.isEmpty()) {
            return activeCourseClasses.get(0).getId();
        }

        List<CourseClass> allCourseClasses = courseClassRepository
                .findByClassInfo_TrainingProgram_IdOrderByUpdatedDateDesc(trainingProgramId);
        if (!allCourseClasses.isEmpty()) {
            return allCourseClasses.get(0).getId();
        }

        throw new ResourceNotFoundException("No course class found for training program: " + trainingProgramId);
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
