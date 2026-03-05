package com.example.starter_project_2025.system.topic.controller;

import com.example.starter_project_2025.system.topic.dto.TopicCreateRequest;
import com.example.starter_project_2025.system.topic.dto.TopicResponse;
import com.example.starter_project_2025.system.topic.dto.TopicUpdateRequest;
import com.example.starter_project_2025.system.topic.service.TopicService;
import com.example.starter_project_2025.system.common.dto.ImportResultResponse;

import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import lombok.RequiredArgsConstructor;

import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
@Tag(name = "Topic Management", description = "Topic management APIs")
@SecurityRequirement(name = "bearerAuth")
public class TopicController {

    private final TopicService topicService;

    // ─── 3.2.17.2 Create Topic ──────────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasAuthority('TOPIC_CREATE')")
    @Operation(summary = "Create topic")
    public ResponseEntity<TopicResponse> create(@RequestBody TopicCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(topicService.create(request));
    }

    // ─── Update Topic (Nếu cần) ──────────────────────────────────────────
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('TOPIC_UPDATE')")
    @Operation(summary = "Update topic")
    public ResponseEntity<TopicResponse> update(@PathVariable UUID id,
            @RequestBody TopicUpdateRequest request) {
        return ResponseEntity.ok(topicService.update(id, request));
    }

    // ─── Get Detail ──────────────────────────────────────────────────────
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('TOPIC_READ')")
    @Operation(summary = "Get topic detail")
    public ResponseEntity<TopicResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(topicService.getById(id));
    }

    // ─── 3.2.17.1 Topic List (Search & Filter) ──────────────────────────
    @GetMapping
    @PreAuthorize("hasAuthority('TOPIC_READ')")
    @Operation(summary = "Get all topics with search and filters")
    public ResponseEntity<Page<TopicResponse>> getAll(
            @RequestParam(required = false) String keyword, // Search topics input
            @RequestParam(required = false) String level, // Level filter (Beginner, etc.)
            @RequestParam(required = false) String status, // Status filter (Active, Draft, etc.)
            @PageableDefault(page = 0, size = 10) Pageable pageable) {
        return ResponseEntity.ok(topicService.getAll(keyword, level, status, pageable));
    }

    // ─── 3.2.17.3 Delete Topic ──────────────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('TOPIC_DELETE')")
    @Operation(summary = "Delete topic")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        topicService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ─── 3.2.17.1 Export Topics ─────────────────────────────────────────
    @GetMapping("/export")
    @PreAuthorize("hasAuthority('TOPIC_EXPORT')")
    @Operation(summary = "Export topics to Excel")
    public ResponseEntity<InputStreamResource> exportTopics() throws IOException {
        ByteArrayInputStream in = topicService.exportTopics();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=topics_export.xlsx");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

    // ─── 3.2.17.1 Download Template ─────────────────────────────────────
    @GetMapping("/template")
    @Operation(summary = "Download topic import template")
    public ResponseEntity<InputStreamResource> downloadTemplate() throws IOException {
        ByteArrayInputStream in = topicService.downloadTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=topic_import_template.xlsx");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

    // ─── 3.2.17.1 Import Topics ─────────────────────────────────────────
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('TOPIC_IMPORT')")
    @Operation(summary = "Import topics from Excel")
    public ResponseEntity<ImportResultResponse> importTopics(@RequestParam("file") MultipartFile file)
            throws IOException {
        return ResponseEntity.ok(topicService.importTopics(file));
    }
}