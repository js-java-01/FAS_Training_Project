package com.example.starter_project_2025.system.topic.controller;

import com.example.starter_project_2025.system.topic.dto.*;
import com.example.starter_project_2025.system.topic.service.TopicAssessmentSchemeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/topics/{topicId}/assessment-scheme")
@RequiredArgsConstructor
public class TopicAssessmentSchemeController {

    private final TopicAssessmentSchemeService service;

    // ================= SCHEME CONFIG =================

    @GetMapping("/config")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROGRAM_MANAGER')")
    public AssessmentSchemeConfigDTO getSchemeConfig(@PathVariable UUID topicId) {
        return service.getSchemeConfig(topicId);
    }

    @PutMapping("/config")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROGRAM_MANAGER')")
    public AssessmentSchemeConfigDTO updateSchemeConfig(
            @PathVariable UUID topicId,
            @Valid @RequestBody AssessmentSchemeConfigDTO dto
    ) {
        return service.updateSchemeConfig(topicId, dto);
    }

    // ================= COMPONENT =================

    @GetMapping("/components")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROGRAM_MANAGER')")
    public List<AssessmentComponentResponse> getComponents(@PathVariable UUID topicId) {
        return service.getComponents(topicId);
    }

    @PostMapping("/components")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROGRAM_MANAGER')")
    public AssessmentComponentResponse addComponent(
            @PathVariable UUID topicId,
            @Valid @RequestBody AssessmentComponentRequest request
    ) {
        return service.addComponent(topicId, request);
    }

    @PutMapping("/components")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROGRAM_MANAGER')")
    public List<AssessmentComponentResponse> updateComponents(
            @PathVariable UUID topicId,
            @Valid @RequestBody List<AssessmentComponentRequest> request
    ) {
        return service.updateComponents(topicId, request);
    }

    @DeleteMapping("/components/{componentId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROGRAM_MANAGER')")
    public void deleteComponent(
            @PathVariable UUID topicId,
            @PathVariable UUID componentId
    ) {
        service.deleteComponent(topicId, componentId);
    }

    // ================= TOTAL WEIGHT =================

    @GetMapping("/total-weight")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROGRAM_MANAGER')")
    public Double getTotalWeight(@PathVariable UUID topicId) {
        return service.getTotalWeight(topicId);
    }
}