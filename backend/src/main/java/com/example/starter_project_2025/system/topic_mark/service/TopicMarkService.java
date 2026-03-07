package com.example.starter_project_2025.system.topic_mark.service;

import com.example.starter_project_2025.system.modulegroups.dto.response.ImportResultResponse;
import com.example.starter_project_2025.system.topic_mark.dto.*;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface TopicMarkService {

    /**
     * Add a new gradebook column for a topic  training-class pair.
     * Auto-assigns columnIndex within the AssessmentType group.
     * Creates null-score entries for all currently enrolled students.
     */
    TopicMarkColumnResponse addColumn(UUID topicId, UUID trainingClassId,
                                      TopicMarkColumnRequest request, UUID editorId);

    /**
     * Update the label of an existing column.
     * Always allowed regardless of whether entries exist.
     */
    TopicMarkColumnResponse updateColumnLabel(UUID topicId, UUID trainingClassId,
                                              UUID columnId, String newLabel, UUID editorId);

    /**
     * Delete a column.
     * Only allowed if NO student has a non-null score on this column.
     */
    void deleteColumn(UUID topicId, UUID trainingClassId, UUID columnId);

    /**
     * Get the full gradebook for a topic  training-class pair.
     * Returns dynamic columns + meta columns (FINAL_SCORE, IS_PASSED), one row per enrolled student.
     */
    TopicMarkGradebookResponse getGradebook(UUID topicId, UUID trainingClassId);

    /**
     * Paginated gradebook search.
     * Filters enrolled students by full name (case-insensitive, partial match).
     */
    TopicMarkGradebookSearchResponse searchGradebook(UUID topicId, UUID trainingClassId,
                                                      String keyword, Boolean passed,
                                                      Pageable pageable);

    /**
     * Get the detailed score breakdown for a single student.
     * Includes per-section computed scores, full column list, and audit history.
     */
    TopicMarkDetailResponse getStudentDetail(UUID topicId, UUID trainingClassId, UUID userId);

    /**
     * Save / update scores for a student.
     * For every changed score, an audit history record is written.
     * If ALL column scores are now non-null, the final score is recomputed.
     */
    TopicMarkDetailResponse updateScores(UUID topicId, UUID trainingClassId, UUID userId,
                                         UpdateTopicMarkRequest request, UUID editorId);

    /**
     * Generate an Excel template for score entry (empty scores, ready to fill).
     */
    ResponseEntity<byte[]> exportGradebookTemplate(UUID topicId, UUID trainingClassId);

    /**
     * Export the full gradebook with actual scores.
     * Pass cells are green, Fail cells are red.
     */
    ResponseEntity<byte[]> exportGradebook(UUID topicId, UUID trainingClassId);

    /**
     * Import scores from a filled Excel template.
     * Blank cells are skipped (existing score kept).
     */
    ImportResultResponse importGradebook(UUID topicId, UUID trainingClassId,
                                         MultipartFile file, UUID editorId);

    /**
     * Get paginated score-change history for a topic  training-class pair.
     */
    ScoreHistoryResponse getScoreHistory(UUID topicId, UUID trainingClassId, Pageable pageable);

    /**
     * Initialize a TopicMark row + null entries for a newly enrolled student.
     * Called by EnrollmentService when a student joins a training class that has this topic.
     */
    void initializeForNewStudent(UUID topicId, UUID trainingClassId, UUID userId);
}