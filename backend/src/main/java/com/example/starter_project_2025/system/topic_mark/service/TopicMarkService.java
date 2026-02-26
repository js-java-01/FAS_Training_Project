package com.example.starter_project_2025.system.topic_mark.service;

import com.example.starter_project_2025.system.topic_mark.dto.TopicMarkGradebookResponse;

import java.util.UUID;

public interface TopicMarkService {

    /**
     * Recalculate and update topic mark for a specific user in a course class.
     * This computes the final score based on assessment type weights and submission scores.
     *
     * @param courseClassId The course class ID
     * @param userId The user ID
     */
    void recalculateForUser(UUID courseClassId, UUID userId);

    /**
     * Get gradebook for a course class with all students and their scores.
     *
     * @param courseClassId The course class ID
     * @return Gradebook response with columns and rows
     */
    TopicMarkGradebookResponse getGradebook(UUID courseClassId);

    /**
     * Update comment for a topic mark.
     *
     * @param courseClassId The course class ID
     * @param userId The user ID
     * @param comment The comment to set
     */
    void updateComment(UUID courseClassId, UUID userId, String comment);
}
