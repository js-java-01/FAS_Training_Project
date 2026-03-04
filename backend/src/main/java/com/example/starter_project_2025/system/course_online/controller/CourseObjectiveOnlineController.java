package com.example.starter_project_2025.system.course_online.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.starter_project_2025.system.course_online.dto.CourseObjectiveCreateOnlineRequest;
import com.example.starter_project_2025.system.course_online.dto.CourseObjectiveOnlineResponse;
import com.example.starter_project_2025.system.course_online.dto.ObjectiveUpdateOnlineRequest;
import com.example.starter_project_2025.system.course_online.service.CourseObjectiveOnlineService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses/{courseId}/objectives")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "CourseOnline Objective Management")
public class CourseObjectiveOnlineController {
    private final CourseObjectiveOnlineService service;

    @PostMapping
    @PreAuthorize("hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<CourseObjectiveOnlineResponse> create(
            @PathVariable UUID courseId,
            @RequestBody CourseObjectiveCreateOnlineRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(courseId, request));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('COURSE_READ')")
    public ResponseEntity<List<CourseObjectiveOnlineResponse>> getByCourse(
            @PathVariable UUID courseId) {

        return ResponseEntity.ok(service.getByCourse(courseId));
    }

    @PutMapping("/{objectiveId}")
    @PreAuthorize("hasAnyAuthority('COURSE_UPDATE')")
    public ResponseEntity<CourseObjectiveOnlineResponse> updateObjective(
            @PathVariable UUID courseId,
            @PathVariable UUID objectiveId,
            @Valid @RequestBody ObjectiveUpdateOnlineRequest request) {
        return ResponseEntity.ok(
                service.updateObjective(courseId, objectiveId, request));
    }

    @DeleteMapping("/{objectiveId}")
    @PreAuthorize("hasAnyAuthority('COURSE_UPDATE')")
    public ResponseEntity<Void> deleteObjective(
            @PathVariable UUID courseId,
            @PathVariable UUID objectiveId) {
        service.deleteObjective(courseId, objectiveId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export")
    @PreAuthorize("hasAuthority('COURSE_READ')")
    public ResponseEntity<byte[]> exportObjectives(@PathVariable UUID courseId) {
        return service.exportObjectives(courseId);
    }

    @GetMapping("/template")
    @PreAuthorize("hasAuthority('COURSE_READ')")
    public ResponseEntity<byte[]> downloadTemplate() {
        return service.downloadTemplate();
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<Void> importObjectives(
            @PathVariable UUID courseId,
            @RequestPart("file") MultipartFile file) {
        service.importObjectives(courseId, file);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/clone-from-topic/{topicId}")
    @PreAuthorize("hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<Void> cloneFromTopic(
            @PathVariable UUID courseId,
            @PathVariable UUID topicId) {
        service.cloneFromTopic(courseId, topicId);
        return ResponseEntity.ok().build();
    }
}
