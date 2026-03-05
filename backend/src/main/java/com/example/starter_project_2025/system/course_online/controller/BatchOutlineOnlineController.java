package com.example.starter_project_2025.system.course_online.controller;

import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.course_online.dto.AiPreviewLessonOnlineResponse;
import com.example.starter_project_2025.system.course_online.dto.ApplyAiPreviewOnlineRequest;
import com.example.starter_project_2025.system.course_online.dto.BatchCreateOnlineRequest;
import com.example.starter_project_2025.system.course_online.service.BatchOutlineOnlineService;

import jakarta.validation.Valid;
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
@RequestMapping("/api/batch-outline")
public class BatchOutlineOnlineController {

    private final BatchOutlineOnlineService batchOutlineService;

    @PostMapping
    @PreAuthorize("hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<Void> createBatch(
            @Valid @RequestBody BatchCreateOnlineRequest request) {
        batchOutlineService.createBatch(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/export/{courseId}")
    @PreAuthorize("hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<byte[]> exportOutline(@PathVariable UUID courseId) {
        return batchOutlineService.exportOutline(courseId);
    }

    @GetMapping("/template")
    @PreAuthorize("hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<byte[]> downloadTemplate() {
        return batchOutlineService.downloadTemplate();
    }

    @PostMapping(value = "/import/{courseId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<ImportResultResponse> importOutline(
            @PathVariable UUID courseId,
            @RequestPart("file") MultipartFile file) {
        ImportResultResponse result = batchOutlineService.importOutline(courseId, file);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{courseId}/outline/ai-preview")
    public List<AiPreviewLessonOnlineResponse> preview(@PathVariable UUID courseId) {
        return batchOutlineService.generatePreview(courseId);
    }

    @PostMapping("/{courseId}/outline/apply-ai-preview")
    @PreAuthorize("hasAuthority('COURSE_OUTLINE_EDIT')")
    public void apply(@PathVariable UUID courseId,
            @RequestBody ApplyAiPreviewOnlineRequest request) {

        batchOutlineService.applyPreview(courseId, request);
    }

    @PostMapping("/{courseId}/clone-from-topic/{topicId}")
    @PreAuthorize("hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<Void> cloneOutlineFromTopic(
            @PathVariable UUID courseId,
            @PathVariable UUID topicId) {
        batchOutlineService.cloneOutlineFromTopic(courseId, topicId);
        return ResponseEntity.ok().build();
    }
}
