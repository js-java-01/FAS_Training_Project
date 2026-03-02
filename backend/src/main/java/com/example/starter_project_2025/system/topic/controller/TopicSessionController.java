package com.example.starter_project_2025.system.topic.controller;

import com.example.starter_project_2025.system.topic.dto.TopicSessionRequest;
import com.example.starter_project_2025.system.topic.dto.TopicSessionResponse;
import com.example.starter_project_2025.system.topic.service.TopicSessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/topics/sessions")
@RequiredArgsConstructor
@Tag(name = "Topic Sessions", description = "Manage sessions under topic lessons")
@SecurityRequirement(name = "bearerAuth")
public class TopicSessionController {

    private final TopicSessionService topicSessionService;

    @PostMapping
    @PreAuthorize("hasAuthority('TOPIC_UPDATE')")
    @Operation(summary = "Create topic session")
    public ResponseEntity<TopicSessionResponse> create(@Valid @RequestBody TopicSessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(topicSessionService.create(request));
    }

    @PutMapping("/{sessionId}")
    @PreAuthorize("hasAuthority('TOPIC_UPDATE')")
    @Operation(summary = "Update topic session")
    public ResponseEntity<TopicSessionResponse> update(
            @PathVariable UUID sessionId,
            @Valid @RequestBody TopicSessionRequest request) {
        return ResponseEntity.ok(topicSessionService.update(sessionId, request));
    }

    @DeleteMapping("/{sessionId}")
    @PreAuthorize("hasAuthority('TOPIC_UPDATE')")
    @Operation(summary = "Delete topic session")
    public ResponseEntity<Void> delete(@PathVariable UUID sessionId) {
        topicSessionService.delete(sessionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{sessionId}")
    @PreAuthorize("hasAuthority('TOPIC_READ')")
    @Operation(summary = "Get topic session by id")
    public ResponseEntity<TopicSessionResponse> getById(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(topicSessionService.getById(sessionId));
    }

    @GetMapping("/lesson/{lessonId}")
    @PreAuthorize("hasAuthority('TOPIC_READ')")
    @Operation(summary = "Get sessions by topic lesson")
    public ResponseEntity<List<TopicSessionResponse>> getByLessonId(@PathVariable UUID lessonId) {
        return ResponseEntity.ok(topicSessionService.getByLessonId(lessonId));
    }
}
