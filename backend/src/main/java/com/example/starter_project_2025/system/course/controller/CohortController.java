package com.example.starter_project_2025.system.course.controller;

import com.example.starter_project_2025.system.course.dto.CohortCreateRequest;
import com.example.starter_project_2025.system.course.dto.CohortResponse;
import com.example.starter_project_2025.system.course.dto.CohortUpdateRequest;
import com.example.starter_project_2025.system.course.service.CohortService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cohorts")
@RequiredArgsConstructor
@Tag(name = "Cohort Management", description = "Course cohort management APIs")
@SecurityRequirement(name = "bearerAuth")
public class CohortController {

    private final CohortService cohortService;

    @PostMapping
    @PreAuthorize("hasAuthority('COHORT_CREATE')")
    @Operation(summary = "Create cohort")
    public ResponseEntity<CohortResponse> create(@RequestBody CohortCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cohortService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('COHORT_UPDATE')")
    @Operation(summary = "Update cohort")
    public ResponseEntity<CohortResponse> update(@PathVariable UUID id,
            @RequestBody CohortUpdateRequest request) {
        return ResponseEntity.ok(cohortService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('COHORT_DELETE')")
    @Operation(summary = "Delete cohort")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        cohortService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('COHORT_READ')")
    @Operation(summary = "Get cohort by ID")
    public ResponseEntity<CohortResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(cohortService.getById(id));
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAuthority('COHORT_READ')")
    @Operation(summary = "Get cohorts by course")
    public ResponseEntity<List<CohortResponse>> getByCourseId(@PathVariable UUID courseId) {
        return ResponseEntity.ok(cohortService.getByCourseId(courseId));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('COHORT_READ')")
    @Operation(summary = "Get all cohorts")
    public ResponseEntity<List<CohortResponse>> getAll() {
        return ResponseEntity.ok(cohortService.getAll());
    }

    @GetMapping("/export")
    @PreAuthorize("hasAuthority('COHORT_READ')")
    @Operation(summary = "Export cohorts by course to Excel")
    public ResponseEntity<byte[]> exportCohorts(@RequestParam UUID courseId) {
        return cohortService.exportCohorts(courseId);
    }

    @GetMapping("/template")
    @PreAuthorize("hasAuthority('COHORT_READ')")
    @Operation(summary = "Download cohort import template")
    public ResponseEntity<byte[]> downloadTemplate() {
        return cohortService.downloadTemplate();
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('COHORT_CREATE')")
    @Operation(summary = "Import cohorts from Excel")
    public ResponseEntity<Void> importCohorts(
            @RequestParam UUID courseId,
            @RequestPart("file") MultipartFile file) {
        cohortService.importCohorts(courseId, file);
        return ResponseEntity.ok().build();
    }
}
