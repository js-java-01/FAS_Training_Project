package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.system.assessment.dto.AssessmentDTO;
import com.example.starter_project_2025.system.assessment.dto.CreateAssessmentRequest;
import com.example.starter_project_2025.system.assessment.dto.UpdateAssessmentRequest;
import com.example.starter_project_2025.system.assessment.entity.AssessmentStatus;
import com.example.starter_project_2025.system.assessment.service.AssessmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/assessment")
public class AssessmentController {
    @Autowired
    private AssessmentService assessmentService;

    @PostMapping
    public ResponseEntity<AssessmentDTO> create(@Valid @RequestBody CreateAssessmentRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(assessmentService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssessmentDTO> update(@PathVariable Long id, @Valid @RequestBody UpdateAssessmentRequest request
    ) {
        return ResponseEntity.ok(
                assessmentService.update(id, request)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssessmentDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                assessmentService.getById(id)
        );
    }

    @GetMapping
    public ResponseEntity<Page<AssessmentDTO>> search(
            @RequestParam(required = false) String keyword,

            @RequestParam(required = false)
            AssessmentStatus status,

            @RequestParam(required = false)
            Long assessmentTypeId,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate createdFrom,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate createdTo,

            @PageableDefault(size = 20, sort = "createdAt")
            Pageable pageable
    ) {
        return ResponseEntity.ok(
                assessmentService.search(
                        keyword,
                        status,
                        assessmentTypeId,
                        createdFrom,
                        createdTo,
                        pageable
                )
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        assessmentService.delete(id);
    }
}
