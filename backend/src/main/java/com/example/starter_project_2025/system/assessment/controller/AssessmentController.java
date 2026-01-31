package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.system.assessment.dto.AssessmentDTO;
import com.example.starter_project_2025.system.assessment.dto.CreateAssessmentRequest;
import com.example.starter_project_2025.system.assessment.dto.UpdateAssessmentRequest;
import com.example.starter_project_2025.system.assessment.service.AssessmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    @Autowired
    private AssessmentService assessService;

    @PostMapping
    public ResponseEntity<AssessmentDTO> create(@Valid @RequestBody CreateAssessmentRequest re) {

        AssessmentDTO saved = assessService.createAssessment(re);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssessmentDTO> update(@PathVariable String id,@Valid @RequestBody UpdateAssessmentRequest re) {

        AssessmentDTO updated = assessService.updateAssessment(id, re);
        return ResponseEntity.ok(updated);
    }

    @GetMapping
    public ResponseEntity<List<AssessmentDTO>> getAll() {
        return ResponseEntity.ok(assessService.getAllAssessments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssessmentDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(assessService.findById(id));
    }

    @GetMapping("/search/name")
    public ResponseEntity<List<AssessmentDTO>> searchByName(@RequestParam String name) {

        return ResponseEntity.ok(
                assessService.findAssessmentByName(name)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        assessService.deleteAssessment(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/import",consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<List<AssessmentDTO>> importAssessments(
            @RequestParam("file") MultipartFile file
    ) {
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



}
