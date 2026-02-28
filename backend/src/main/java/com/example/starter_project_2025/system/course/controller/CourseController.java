package com.example.starter_project_2025.system.course.controller;

import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.course.dto.CourseCreateRequest;
import com.example.starter_project_2025.system.course.dto.CourseResponse;
import com.example.starter_project_2025.system.course.dto.CourseUpdateRequest;
import com.example.starter_project_2025.system.course.service.CourseService;

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
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@Tag(name = "Course Management", description = "Course management APIs")
@SecurityRequirement(name = "bearerAuth")
public class CourseController {

        private final CourseService courseService;

        @PostMapping
        @PreAuthorize("hasAuthority('COURSE_CREATE')")
        @Operation(summary = "Create course")
        public ResponseEntity<CourseResponse> create(@RequestBody CourseCreateRequest request) {
                return ResponseEntity.status(HttpStatus.CREATED).body(courseService.create(request));
        }

        @PutMapping("/{id}")
        @PreAuthorize("hasAuthority('COURSE_UPDATE')")
        @Operation(summary = "Update course")
        public ResponseEntity<CourseResponse> update(@PathVariable UUID id,
                        @RequestBody CourseUpdateRequest request) {
                return ResponseEntity.ok(courseService.update(id, request));
        }

        @GetMapping("/{id}")
        @PreAuthorize("hasAuthority('COURSE_READ')")
        @Operation(summary = "Get course detail")
        public ResponseEntity<CourseResponse> getById(@PathVariable UUID id) {
                return ResponseEntity.ok(courseService.getById(id));
        }

        @GetMapping
        @PreAuthorize("hasAuthority('COURSE_READ')")
        @Operation(summary = "Get all courses")
        public ResponseEntity<Page<CourseResponse>> getAll(
                        @RequestParam(required = false) String keyword,
                        @RequestParam(required = false) String status,
                        @RequestParam(required = false) String trainerId,
                        @PageableDefault(page = 0, size = 10) Pageable pageable) {
                return ResponseEntity.ok(courseService.getAll(keyword, status, trainerId, pageable));
        }

        @DeleteMapping("/{id}")
        @PreAuthorize("hasAuthority('COURSE_DELETE')")
        @Operation(summary = "Delete course")
        public ResponseEntity<Void> delete(@PathVariable UUID id) {
                courseService.delete(id);
                return ResponseEntity.noContent().build();
        }

        // ─── Export ──────────────────────────────────────────────────────────────
        @GetMapping("/export")
        @PreAuthorize("hasAuthority('COURSE_EXPORT')")
        @Operation(summary = "Export all courses to Excel")
        public ResponseEntity<InputStreamResource> exportCourses() throws IOException {
                ByteArrayInputStream in = courseService.exportCourses();
                HttpHeaders headers = new HttpHeaders();
                headers.add("Content-Disposition", "attachment; filename=courses_export.xlsx");
                return ResponseEntity.ok()
                                .headers(headers)
                                .contentType(MediaType.parseMediaType(
                                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                                .body(new InputStreamResource(in));
        }

        // ─── Download Template ────────────────────────────────────────────────────
        @GetMapping("/template")
        @Operation(summary = "Download course import template")
        public ResponseEntity<InputStreamResource> downloadTemplate() throws IOException {
                ByteArrayInputStream in = courseService.downloadTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.add("Content-Disposition", "attachment; filename=courses_import_template.xlsx");
                return ResponseEntity.ok()
                                .headers(headers)
                                .contentType(MediaType.parseMediaType(
                                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                                .body(new InputStreamResource(in));
        }

        // ─── Import ───────────────────────────────────────────────────────────────
        @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @PreAuthorize("hasAuthority('COURSE_IMPORT')")
        @Operation(summary = "Import courses from Excel")
        public ResponseEntity<ImportResultResponse> importCourses(
                        @RequestParam("file") MultipartFile file) throws IOException {
                return ResponseEntity.ok(courseService.importCourses(file));
        }
}