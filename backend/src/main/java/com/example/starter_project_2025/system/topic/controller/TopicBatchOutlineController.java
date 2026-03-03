package com.example.starter_project_2025.system.topic.controller;

import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.topic.dto.TopicAiPreviewLessonResponse;
import com.example.starter_project_2025.system.topic.dto.TopicApplyAiPreviewRequest;
import com.example.starter_project_2025.system.topic.dto.TopicBatchCreateRequest;
import com.example.starter_project_2025.system.topic.service.TopicBatchOutlineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/topics/{topicId}/batch-outline")
public class TopicBatchOutlineController {

    private final TopicBatchOutlineService topicBatchOutlineService;

    @PostMapping("/batch")
    @PreAuthorize("hasAuthority('TOPIC_UPDATE')")
    public ResponseEntity<Void> createBatch(
            @PathVariable UUID topicId,
            @RequestBody TopicBatchCreateRequest request) {
        request.setTopicId(topicId);
        topicBatchOutlineService.createBatch(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/export")
    @PreAuthorize("hasAuthority('TOPIC_UPDATE')")
    public ResponseEntity<byte[]> exportOutline(@PathVariable UUID topicId) {
        return topicBatchOutlineService.exportOutline(topicId);
    }

    @GetMapping("/template")
    @PreAuthorize("hasAuthority('TOPIC_UPDATE')")
    public ResponseEntity<byte[]> downloadTemplate(@PathVariable UUID topicId) {
        return topicBatchOutlineService.downloadTemplate();
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('TOPIC_UPDATE')")
    public ResponseEntity<ImportResultResponse> importOutline(
            @PathVariable UUID topicId,
            @RequestPart("file") MultipartFile file) {
        ImportResultResponse result = topicBatchOutlineService.importOutline(topicId, file);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/ai-preview")
    @PreAuthorize("hasAuthority('TOPIC_UPDATE')")
    public List<TopicAiPreviewLessonResponse> generateAiPreview(@PathVariable UUID topicId) {
        return topicBatchOutlineService.generateAiPreview(topicId);
    }

    @PostMapping("/apply-ai-preview")
    @PreAuthorize("hasAuthority('TOPIC_UPDATE')")
    public ResponseEntity<Void> applyAiPreview(
            @PathVariable UUID topicId,
            @RequestBody TopicApplyAiPreviewRequest request) {
        topicBatchOutlineService.applyAiPreview(topicId, request);
        return ResponseEntity.ok().build();
    }
}
