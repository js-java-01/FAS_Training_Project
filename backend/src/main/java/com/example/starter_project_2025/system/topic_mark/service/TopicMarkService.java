package com.example.starter_project_2025.system.topic_mark.service;

import com.example.starter_project_2025.system.modulegroups.dto.response.ImportResultResponse;
import com.example.starter_project_2025.system.topic_mark.dto.*;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface TopicMarkService {

    /**
     * Get the full gradebook for a topic–training-class pair.
     * Columns are derived from TopicAssessmentComponents (count N → N columns per component).
     * isGraded=false components are shown but do not contribute to final score.
     */
    TopicMarkGradebookResponse getGradebook(UUID topicId, UUID trainingClassId);

    /**
     * Paginated gradebook search.
     * Filters enrolled students by full name or email (case-insensitive, partial match).
     */
    TopicMarkGradebookSearchResponse searchGradebook(UUID topicId, UUID trainingClassId,
                                                      String keyword, Boolean passed,
                                                      Pageable pageable);

    /**
     * Get the detailed score breakdown for a single student.
     * Includes per-component slot scores, computed section scores, and audit history.
     */
    TopicMarkDetailResponse getStudentDetail(UUID topicId, UUID trainingClassId, UUID userId);

    /**
     * Save / update scores for a student.
     * Each EntryUpdate carries componentId + componentIndex + score.
     * If ALL graded component slots are non-null, the final score is recomputed.
     */
    TopicMarkDetailResponse updateScores(UUID topicId, UUID trainingClassId, UUID userId,
                                         UpdateTopicMarkRequest request, UUID editorId);

    /**
     * Generate an Excel template for score entry (empty scores, ready to fill).
     */
    ResponseEntity<byte[]> exportGradebookTemplate(UUID topicId, UUID trainingClassId);

    /**
     * Export the full gradebook with actual scores.
     */
    ResponseEntity<byte[]> exportGradebook(UUID topicId, UUID trainingClassId);

    /**
     * Import scores from a filled Excel template.
     * Blank cells are skipped (existing score kept).
     */
    ImportResultResponse importGradebook(UUID topicId, UUID trainingClassId,
                                         MultipartFile file, UUID editorId);

    /**
     * Get paginated score-change history for a topic–training-class pair.
     */
    ScoreHistoryResponse getScoreHistory(UUID topicId, UUID trainingClassId, Pageable pageable);

    /**
     * Initialize a TopicMark row + null entries for a newly enrolled student.
     */
    void initializeForNewStudent(UUID topicId, UUID trainingClassId, UUID userId);
}