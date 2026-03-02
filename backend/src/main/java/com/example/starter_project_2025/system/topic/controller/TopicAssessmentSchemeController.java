package com.example.starter_project_2025.system.topic.controller;

import com.example.starter_project_2025.system.topic.dto.*;
import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.topic.service.TopicAssessmentSchemeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/topics/{topicId}/assessment-scheme")
@RequiredArgsConstructor
public class TopicAssessmentSchemeController {

    private final TopicAssessmentSchemeService service;

    // ================= SCHEME CONFIG =================

    @GetMapping("/config")
    @PreAuthorize("hasAuthority('TOPIC_READ')")
    public AssessmentSchemeConfigDTO getSchemeConfig(@PathVariable UUID topicId) {
        return service.getSchemeConfig(topicId);
    }

    @PutMapping("/config")
    @PreAuthorize("hasAuthority('TOPIC_UPDATE')")
    public AssessmentSchemeConfigDTO updateSchemeConfig(
            @PathVariable UUID topicId,
            @Valid @RequestBody AssessmentSchemeConfigDTO dto
    ) {
        return service.updateSchemeConfig(topicId, dto);
    }

    // ================= COMPONENT =================

    @GetMapping("/components")
    @PreAuthorize("hasAuthority('TOPIC_READ')")
    public List<AssessmentComponentResponse> getComponents(@PathVariable UUID topicId) {
        return service.getComponents(topicId);
    }

    @PostMapping("/components")
    @PreAuthorize("hasAuthority('TOPIC_UPDATE')")
    public AssessmentComponentResponse addComponent(
            @PathVariable UUID topicId,
            @Valid @RequestBody AssessmentComponentRequest request
    ) {
        return service.addComponent(topicId, request);
    }

    @PutMapping("/components")
    @PreAuthorize("hasAuthority('TOPIC_UPDATE')")
    public List<AssessmentComponentResponse> updateComponents(
            @PathVariable UUID topicId,
            @Valid @RequestBody List<AssessmentComponentRequest> request
    ) {
        return service.updateComponents(topicId, request);
    }

    @DeleteMapping("/components/{componentId}")
    @PreAuthorize("hasAuthority('TOPIC_UPDATE')")
    public void deleteComponent(
            @PathVariable UUID topicId,
            @PathVariable UUID componentId
    ) {
        service.deleteComponent(topicId, componentId);
    }

    // ================= TOTAL WEIGHT =================

    @GetMapping("/total-weight")
    @PreAuthorize("hasAuthority('TOPIC_READ')")
    public Double getTotalWeight(@PathVariable UUID topicId) {
        return service.getTotalWeight(topicId);
    }

        // ================= IMPORT / EXPORT COMPONENTS =================

        @GetMapping("/components/export")
        @PreAuthorize("hasAuthority('TOPIC_READ')")
        public ResponseEntity<byte[]> exportComponents(@PathVariable UUID topicId) {
        byte[] data = service.exportComponents(topicId);

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=assessment-components-" + topicId + ".xlsx")
            .contentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(data);
        }

        @PostMapping("/components/import")
        @PreAuthorize("hasAuthority('TOPIC_UPDATE')")
        public ImportResultResponse importComponents(
            @PathVariable UUID topicId,
            @RequestParam("file") MultipartFile file
        ) {
        return service.importComponents(topicId, file);
        }

        @GetMapping("/components/template")
        @PreAuthorize("hasAuthority('TOPIC_READ')")
        public ResponseEntity<byte[]> downloadComponentsTemplate() {
        byte[] data = service.downloadComponentsTemplate();

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=assessment-components-template.xlsx")
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(data);
        }
}