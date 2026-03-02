package com.example.starter_project_2025.system.topic.controller;

import com.example.starter_project_2025.system.topic.dto.TopicLessonCreateRequest;
import com.example.starter_project_2025.system.topic.dto.TopicLessonResponse;
import com.example.starter_project_2025.system.topic.dto.TopicLessonUpdateRequest;
import com.example.starter_project_2025.system.topic.service.TopicLessonService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/topics/{topicId}/lessons")
@RequiredArgsConstructor
@Tag(name = "Topic Outline (Lessons)", description = "Manage lesson outlines under a topic")
@SecurityRequirement(name = "bearerAuth")
public class TopicLessonController {

    private final TopicLessonService topicLessonService;

    // ─── 3.2.17.19 View Topic Outline ──────────────────────────────────
    @GetMapping
    @PreAuthorize("hasAuthority('TOPIC_READ')")
    @Operation(summary = "Get all lessons (outline) for a topic")
    public ResponseEntity<List<TopicLessonResponse>> getLessonsByTopicId(@PathVariable UUID topicId) {
        return ResponseEntity.ok(topicLessonService.getLessonsByTopicId(topicId));
    }

    // ─── 3.2.17.20 Add Topic Outline ───────────────────────────────────
    @PostMapping
    @PreAuthorize("hasAuthority('TOPIC_UPDATE')")
    @Operation(summary = "Add a new lesson (outline item) to a topic")
    public ResponseEntity<TopicLessonResponse> create(
            @PathVariable UUID topicId,
            @RequestBody TopicLessonCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(topicLessonService.create(topicId, request));
    }

    // ─── Update a lesson ────────────────────────────────────────────────
    @PutMapping("/{lessonId}")
    @PreAuthorize("hasAuthority('TOPIC_UPDATE')")
    @Operation(summary = "Update a lesson in the topic outline")
    public ResponseEntity<TopicLessonResponse> update(
            @PathVariable UUID topicId,
            @PathVariable UUID lessonId,
            @RequestBody TopicLessonUpdateRequest request) {
        return ResponseEntity.ok(topicLessonService.update(topicId, lessonId, request));
    }

    // ─── Delete a lesson ────────────────────────────────────────────────
    @DeleteMapping("/{lessonId}")
    @PreAuthorize("hasAuthority('TOPIC_UPDATE')")
    @Operation(summary = "Remove a lesson from the topic outline")
    public ResponseEntity<Void> delete(
            @PathVariable UUID topicId,
            @PathVariable UUID lessonId) {
        topicLessonService.delete(topicId, lessonId);
        return ResponseEntity.noContent().build();
    }
}
