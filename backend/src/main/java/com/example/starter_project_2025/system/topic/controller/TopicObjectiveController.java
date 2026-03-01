package com.example.starter_project_2025.system.topic.controller;

import com.example.starter_project_2025.system.modulegroups.dto.response.PageResponse;
import com.example.starter_project_2025.system.topic.dto.TopicObjectiveCreateRequest;
import com.example.starter_project_2025.system.topic.dto.TopicObjectiveResponse;
import com.example.starter_project_2025.system.topic.dto.TopicObjectiveUpdateRequest;
import com.example.starter_project_2025.system.topic.service.TopicObjectiveService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/topics/{topicId}/objectives")
@RequiredArgsConstructor
@Tag(name = "Topic Objectives Management", description = "Topic objectives management APIs")
@SecurityRequirement(name = "bearerAuth")
public class TopicObjectiveController {

    private final TopicObjectiveService objectiveService;

    @PostMapping
    @PreAuthorize("hasAuthority('TOPIC_CREATE')")
    public ResponseEntity<TopicObjectiveResponse> create(
            @PathVariable UUID topicId,
            @Valid @RequestBody TopicObjectiveCreateRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(objectiveService.create(topicId, request));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('TOPIC_READ')")
    public ResponseEntity<Page<TopicObjectiveResponse>> getByTopic(
            @PathVariable UUID topicId,
            Pageable pageable) {

        return ResponseEntity.ok(
                objectiveService.getByTopic(topicId, pageable)
        );
    }

    @PutMapping("/{objectiveId}")
    @PreAuthorize("hasAuthority('TOPIC_UPDATE')")
    public ResponseEntity<TopicObjectiveResponse> update(
            @PathVariable UUID topicId,
            @PathVariable UUID objectiveId,
            @Valid @RequestBody TopicObjectiveUpdateRequest request) {

        return ResponseEntity.ok(
                objectiveService.update(topicId, objectiveId, request)
        );
    }

    @DeleteMapping("/{objectiveId}")
    @PreAuthorize("hasAuthority('TOPIC_DELETE')")
    public ResponseEntity<Void> delete(
            @PathVariable UUID topicId,
            @PathVariable UUID objectiveId) {

        objectiveService.delete(topicId, objectiveId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export")
    @PreAuthorize("hasAuthority('TOPIC_READ')")
    public ResponseEntity<byte[]> exportObjectives(@PathVariable UUID topicId) {
        return objectiveService.exportObjectives(topicId);
    }

    @GetMapping("/template")
    @PreAuthorize("hasAuthority('TOPIC_READ')")
    public ResponseEntity<byte[]> downloadTemplate() {
        return objectiveService.downloadTemplate();
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('TOPIC_UPDATE')")
    public ResponseEntity<Void> importObjectives(
            @PathVariable UUID topicId,
            @RequestPart("file") MultipartFile file) {

        objectiveService.importObjectives(topicId, file);
        return ResponseEntity.ok().build();
    }
}