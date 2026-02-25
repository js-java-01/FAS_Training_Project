package com.example.starter_project_2025.system.topic_mark.controller;

import com.example.starter_project_2025.system.topic_mark.dto.TopicMarkGradebookResponse;
import com.example.starter_project_2025.system.topic_mark.dto.UpdateCommentRequest;
import com.example.starter_project_2025.system.topic_mark.service.TopicMarkService;
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
public class TopicMarkController {

    private final TopicMarkService topicMarkService;

    /**
     * GET /api/course-classes/{courseClassId}/topic-marks
     * Get gradebook for a course class.
     */
    @GetMapping
    public ResponseEntity<TopicMarkGradebookResponse> getGradebook(
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
    public ResponseEntity<Void> updateComment(
            @PathVariable UUID courseClassId,
            @PathVariable UUID userId,
            @RequestBody UpdateCommentRequest request
    ) {
        topicMarkService.updateComment(courseClassId, userId, request.getComment());
        return ResponseEntity.ok().build();
    }
}
