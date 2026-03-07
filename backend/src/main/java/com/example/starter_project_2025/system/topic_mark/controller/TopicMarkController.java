package com.example.starter_project_2025.system.topic_mark.controller;

import com.example.starter_project_2025.system.modulegroups.dto.response.ApiResponse;
import com.example.starter_project_2025.system.modulegroups.dto.response.ImportResultResponse;
import com.example.starter_project_2025.system.topic_mark.dto.*;
import com.example.starter_project_2025.system.topic_mark.service.TopicMarkService;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
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
 *   GET    /api/topics/{topicId}/topic-marks?trainingClassId=...                full gradebook
 *   GET    /api/topics/{topicId}/topic-marks/search?trainingClassId=...         paginated search
 *   GET    /api/topics/{topicId}/topic-marks/{userId}?trainingClassId=...       student detail
 *   PUT    /api/topics/{topicId}/topic-marks/{userId}?trainingClassId=...       update scores
 *   GET    /api/topics/{topicId}/topic-marks/history?trainingClassId=...        change history
 *
 * Export / Import:
 *   GET    /api/topics/{topicId}/topic-marks/export?trainingClassId=...            export gradebook (scores)
 *   GET    /api/topics/{topicId}/topic-marks/export/template?trainingClassId=...   download template
 *   POST   /api/topics/{topicId}/topic-marks/import?trainingClassId=...            import scores * </pre>
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/topics/{topicId}")
@Tag(name = "Topic Marks (Gradebook)", description = "APIs for managing gradebook columns and scores per topic  training class")
@SecurityRequirement(name = "bearerAuth")
public class TopicMarkController {

    private final TopicMarkService topicMarkService;
    private final UserRepository userRepository;

    @Schema(name = "TopicMarkImportRequest", description = "Multipart payload for gradebook import")
    static class TopicMarkImportRequest {
        @Schema(description = "Excel file (.xlsx)", type = "string", format = "binary", requiredMode = Schema.RequiredMode.REQUIRED)
        public MultipartFile file;
    }

    //  Gradebook endpoints 

    @GetMapping("/topic-marks")
    @Operation(summary = "Get full gradebook",
               description = "Returns active score columns and one row per enrolled student.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Gradebook retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Topic or training class not found", content = @Content)
    })
    public ResponseEntity<TopicMarkGradebookResponse> getGradebook(
            @PathVariable UUID topicId,
            @Parameter(description = "Training class ID", required = true) @RequestParam UUID trainingClassId) {
        return ResponseEntity.ok(topicMarkService.getGradebook(topicId, trainingClassId));
    }

    @GetMapping("/topic-marks/search")
    @Operation(summary = "Search gradebook rows (paginated)",
               description = "Filters enrolled students by name or email. Supports ?keyword=...&page=0&size=10&sort=fullName,asc")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Search result retrieved successfully")
    })
    public ResponseEntity<ApiResponse<TopicMarkGradebookSearchResponse>> searchGradebook(
            @PathVariable UUID topicId,
            @RequestParam UUID trainingClassId,
            @Parameter(description = "Student name or email (partial, case-insensitive)") @RequestParam(required = false) String keyword,
            @Parameter(description = "true = passed only, false = failed only, omit = all") @RequestParam(required = false) Boolean passed,
            @ParameterObject Pageable pageable) {
        TopicMarkGradebookSearchResponse result = topicMarkService.searchGradebook(
                topicId, trainingClassId, keyword, passed, pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Gradebook retrieved successfully"));
    }

    @GetMapping("/topic-marks/{userId}")
    @Operation(summary = "Get student score detail",
               description = "Returns per-section scores, individual column scores, and full audit history for one student.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Detail retrieved"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Topic, class, or user not found", content = @Content)
    })
    public ResponseEntity<TopicMarkDetailResponse> getStudentDetail(
            @PathVariable UUID topicId,
            @RequestParam UUID trainingClassId,
            @PathVariable UUID userId) {
        return ResponseEntity.ok(topicMarkService.getStudentDetail(topicId, trainingClassId, userId));
    }

    @PutMapping("/topic-marks/{userId}")
    @Operation(summary = "Update student scores",
               description = "Updates one or more column scores. Auto-recomputes final score when all columns are filled.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Scores saved"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error", content = @Content),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not found", content = @Content)
    })
    public ResponseEntity<TopicMarkDetailResponse> updateScores(
            @PathVariable UUID topicId,
            @RequestParam UUID trainingClassId,
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateTopicMarkRequest request,
            Authentication authentication) {
        UUID editorId = resolveCurrentUserId(authentication);
        return ResponseEntity.ok(topicMarkService.updateScores(topicId, trainingClassId, userId, request, editorId));
    }

    @GetMapping("/topic-marks/history")
    @Operation(summary = "Get score change history",
               description = "Paginated list of all score change records. Default sort: updatedAt,desc")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "History retrieved")
    })
    public ResponseEntity<ScoreHistoryResponse> getScoreHistory(
            @PathVariable UUID topicId,
            @RequestParam UUID trainingClassId,
            @ParameterObject Pageable pageable) {
        return ResponseEntity.ok(topicMarkService.getScoreHistory(topicId, trainingClassId, pageable));
    }

    //  Export / Import 

    @GetMapping("/topic-marks/export")
    @Operation(summary = "Export full gradebook with scores",
               description = "Returns Excel (.xlsx) with all scores, final scores, and PASS/FAIL for enrolled students.")
    public ResponseEntity<byte[]> exportGradebook(
            @PathVariable UUID topicId,
            @RequestParam UUID trainingClassId) {
        return topicMarkService.exportGradebook(topicId, trainingClassId);
    }

    @GetMapping("/topic-marks/export/template")
    @Operation(summary = "Download score-entry template",
               description = "Returns empty Excel template ready to fill and import back.")
    public ResponseEntity<byte[]> exportGradebookTemplate(
            @PathVariable UUID topicId,
            @RequestParam UUID trainingClassId) {
        return topicMarkService.exportGradebookTemplate(topicId, trainingClassId);
    }

    @PostMapping(value = "/topic-marks/import", consumes = "multipart/form-data")
    @Operation(summary = "Import gradebook scores from Excel",
               description = "Blank cells = keep existing; filled cells = update. Final scores are auto-recomputed.",
               requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                   required = true,
                   content = @Content(mediaType = "multipart/form-data",
                           schema = @Schema(implementation = TopicMarkImportRequest.class))))
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Import processed"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Import failed")
    })
    public ResponseEntity<ImportResultResponse> importGradebook(
            @PathVariable UUID topicId,
            @RequestParam UUID trainingClassId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        UUID editorId = resolveCurrentUserId(authentication);
        ImportResultResponse response = topicMarkService.importGradebook(topicId, trainingClassId, file, editorId);
        if (response.getMessage() == null || response.getMessage().isBlank()) {
            response.setMessage(response.getFailedCount() > 0
                    ? "Import completed with some failed rows. Please review errors."
                    : "Import gradebook scores successfully");
        }
        return ResponseEntity.ok(response);
    }
    //  Auth helper 

    private UUID resolveCurrentUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("User not found: " + authentication.getName()))
                .getId();
    }
}