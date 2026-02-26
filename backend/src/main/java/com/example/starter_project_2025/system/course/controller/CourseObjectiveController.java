package com.example.starter_project_2025.system.course.controller;

import com.example.starter_project_2025.system.course.dto.CourseObjectiveCreateRequest;
import com.example.starter_project_2025.system.course.dto.CourseObjectiveResponse;
import com.example.starter_project_2025.system.course.dto.ObjectiveUpdateRequest;
import com.example.starter_project_2025.system.course.service.CourseObjectiveService;
import com.example.starter_project_2025.system.course.service.ObjectiveExcelService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses/{courseId}/objectives")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Course Objective Management")
public class CourseObjectiveController {
    private final CourseObjectiveService service;

    @PostMapping
    @PreAuthorize("hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<CourseObjectiveResponse> create(
            @PathVariable UUID courseId,
            @RequestBody CourseObjectiveCreateRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(courseId, request));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('COURSE_READ')")
    public ResponseEntity<List<CourseObjectiveResponse>> getByCourse(
            @PathVariable UUID courseId) {

        return ResponseEntity.ok(service.getByCourse(courseId));
    }

    @PutMapping("/{objectiveId}")
    @PreAuthorize("hasAnyAuthority('COURSE_UPDATE')")
    public ResponseEntity<CourseObjectiveResponse> updateObjective(
            @PathVariable UUID courseId,
            @PathVariable UUID objectiveId,
            @Valid @RequestBody ObjectiveUpdateRequest request
    ) {
        return ResponseEntity.ok(
                service.updateObjective(courseId, objectiveId, request)
        );
    }

    @DeleteMapping("/{objectiveId}")
    @PreAuthorize("hasAnyAuthority('COURSE_UPDATE')")
    public ResponseEntity<Void> deleteObjective(
            @PathVariable UUID courseId,
            @PathVariable UUID objectiveId
    ) {
        service.deleteObjective(courseId, objectiveId);
        return ResponseEntity.noContent().build();
    }

    private final ObjectiveExcelService excelService;

    // ===============================
    // DOWNLOAD TEMPLATE
    // ===============================
    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate(@PathVariable UUID courseId) throws Exception {

        byte[] file = excelService.generateTemplate();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=objective_template.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(file);
    }

    // ===============================
    //  EXPORT
    // ===============================
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportObjectives(
            @PathVariable String courseId) throws Exception {

        byte[] file = excelService.exportObjectives(UUID.fromString(courseId));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=objectives.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(file);
    }

    // ===============================
    //  IMPORT
    // ===============================
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> importObjectives(
            @PathVariable String courseId,
            @RequestParam("file") MultipartFile file) throws Exception {

        excelService.importObjectives(courseId, file);

        return ResponseEntity.ok("Import successful");
    }
}
