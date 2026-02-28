package com.example.starter_project_2025.system.topic_mark.service;

import com.example.starter_project_2025.system.topic_mark.dto.*;

import java.util.UUID;

public interface TopicMarkService {

    // ── Column management ────────────────────────────────────────────────────

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

    // ── Gradebook ────────────────────────────────────────────────────────────

    /**
     * Get the full gradebook for a course class.
     * Returns dynamic columns (one per TopicMarkColumn) + meta columns
     * (FINAL_SCORE, IS_PASSED, COMMENT), plus one row per enrolled student.
     */
    TopicMarkGradebookResponse getGradebook(UUID courseClassId);

    /**
     * Get the detailed score breakdown for a single student in a course class.
     * Includes per-section computed scores, full column list, and audit history.
     */
    TopicMarkDetailResponse getStudentDetail(UUID courseClassId, UUID userId);

    // ── Score entry ──────────────────────────────────────────────────────────

    /**
     * Save / update scores for a student.
     * For every changed score, an audit history record is written.
     * If ALL column scores are now non-null, the final score is computed and stored.
     */
    TopicMarkDetailResponse updateScores(UUID courseClassId, UUID userId,
                                         UpdateTopicMarkRequest request, UUID editorId);

    // ── Initialization ───────────────────────────────────────────────────────

    /**
     * Initialize TopicMark + null entries for a newly enrolled student.
     * Called by EnrollmentService when a student joins a training class.
     */
    void initializeForNewStudent(UUID courseClassId, UUID userId);
}
