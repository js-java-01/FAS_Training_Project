package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.system.assessment.dto.AssessmentDTO;
import com.example.starter_project_2025.system.assessment.dto.CreateAssessmentRequest;
import com.example.starter_project_2025.system.assessment.dto.ImportResultDTO;
import com.example.starter_project_2025.system.assessment.dto.UpdateAssessmentRequest;
import com.example.starter_project_2025.system.assessment.service.AssessmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    @Autowired
    private AssessmentService assessService;

    @PostMapping
    public ResponseEntity<AssessmentDTO> create(
            @Valid @RequestBody CreateAssessmentRequest request) {

        return ResponseEntity.ok(assessService.create(request));
    }

    // ==================== UPDATE ====================
    @PutMapping("/{id}")
    public ResponseEntity<AssessmentDTO> update(
            @PathVariable String id,
            @Valid @RequestBody UpdateAssessmentRequest request) {

        return ResponseEntity.ok(assessService.update(id, request));
    }

    // ==================== DELETE ====================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        assessService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== GET BY ID ====================
    @GetMapping("/{id}")
    public ResponseEntity<AssessmentDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(assessService.findById(id));
    }

    // ==================== SEARCH + PAGINATION ====================
    @GetMapping
    public ResponseEntity<Page<AssessmentDTO>> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String keyword,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fromDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate,

            @PageableDefault(size = 20, sort = "createdAt")
            Pageable pageable
    ) {
        return ResponseEntity.ok(assessService.search(name, keyword, fromDate, toDate, pageable)
        );
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImportResultDTO> importAssessments(@RequestParam("file") MultipartFile file) {

        return ResponseEntity.ok(assessService.importAssessments(file));
    }

    @GetMapping("/export")
    public ResponseEntity<InputStreamResource> exportAssessmentTypes() throws IOException {

        ByteArrayInputStream in = assessService.exportAssessments();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=assessment-types.xlsx");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(new InputStreamResource(in));
    }

    @GetMapping("/template")
    public ResponseEntity<InputStreamResource> downloadTemplate() throws IOException {

        ByteArrayInputStream in = assessService.downloadAssessmentTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=assessment-template.xlsx");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(new InputStreamResource(in));
    }




}
