package com.example.starter_project_2025.system.course.controller;

import com.example.starter_project_2025.system.course.dto.AiPreviewLessonResponse;
import com.example.starter_project_2025.system.course.dto.ApplyAiPreviewRequest;
import com.example.starter_project_2025.system.course.dto.BatchCreateRequest;
import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.course.service.BatchOutlineService;
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
public class BatchOutlineController {

    private final BatchOutlineService batchOutlineService;

    @PostMapping
    @PreAuthorize("hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<Void> createBatch(
            @Valid @RequestBody BatchCreateRequest request) {
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
    public List<AiPreviewLessonResponse> preview(@PathVariable UUID courseId) {
        return batchOutlineService.generatePreview(courseId);
    }

    @PostMapping("/{courseId}/outline/apply-ai-preview")
    @PreAuthorize("hasAuthority('COURSE_OUTLINE_EDIT')")
    public void apply(@PathVariable UUID courseId,
            @RequestBody ApplyAiPreviewRequest request) {

        batchOutlineService.applyPreview(courseId, request);
    }
}
