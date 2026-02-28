package com.example.starter_project_2025.system.topic_mark.service;

import com.example.starter_project_2025.system.topic_mark.dto.*;

import java.util.UUID;
import org.springframework.http.ResponseEntity;

public interface TopicMarkService {

    /**
     * Add a new gradebook column to a course class.
     * Auto-assigns columnIndex within the AssessmentType group.
     * Creates null-score entries for all currently enrolled students.
     */
    TopicMarkColumnResponse addColumn(UUID courseClassId, TopicMarkColumnRequest request, UUID editorId);

    /**
     * Update the label of an existing column.
     * Always allowed regardless of whether entries exist.
     */
    TopicMarkColumnResponse updateColumnLabel(UUID courseClassId, UUID columnId, String newLabel, UUID editorId);

    /**
     * Delete a column from a course class.
     * Only allowed if NO student has a non-null score on this column.
     */
    void deleteColumn(UUID courseClassId, UUID columnId);

    /**
     * Get the full gradebook for a course class.
     * Returns dynamic columns (one per TopicMarkColumn) + meta columns
     * (FINAL_SCORE, IS_PASSED, COMMENT), plus one row per enrolled student.
     */
    TopicMarkGradebookResponse getGradebook(UUID courseClassId);
    /**
     * Paginated gradebook search.
     * Filters enrolled students by full name (case-insensitive, partial match).
     * Returns column definitions once + paginated student rows.
     */
    TopicMarkGradebookSearchResponse searchGradebook(UUID courseClassId, String keyword,
                                                     Boolean passed,
                                                     org.springframework.data.domain.Pageable pageable);
    /**
     * Get the detailed score breakdown for a single student in a course class.
     * Includes per-section computed scores, full column list, and audit history.
     */
    TopicMarkDetailResponse getStudentDetail(UUID courseClassId, UUID userId);

    /**
     * Save / update scores for a student.
     * For every changed score, an audit history record is written.
     * If ALL column scores are now non-null, the final score is computed and stored.
     */
    TopicMarkDetailResponse updateScores(UUID courseClassId, UUID userId,
                                         UpdateTopicMarkRequest request, UUID editorId);

    /**
     * Generate an Excel template for score entry.
     * Row 0 (hidden meta): column IDs for machine matching on import.
     * Row 1 (bold header): visible labels (STT | Họ và tên | Email | col labels…).
     * Row 2+ : one row per enrolled student, score cells empty (ready to fill).
     */
    ResponseEntity<byte[]> exportGradebookTemplate(UUID courseClassId);

    /**
     * Export the full gradebook with actual scores.
     * Row 0 (bold header): STT | Họ và tên | Email | <col labels…> | Final Score | Passed.
     * Row 1+: one row per enrolled student with all entered scores, final score, and pass/fail.
     * Pass cells are green, Fail cells are red.
     */
    ResponseEntity<byte[]> exportGradebook(UUID courseClassId);

    /**
     * Initialize TopicMark + null entries for a newly enrolled student.
     * Called by EnrollmentService when a student joins a training class.
     */
    void initializeForNewStudent(UUID courseClassId, UUID userId);
}
