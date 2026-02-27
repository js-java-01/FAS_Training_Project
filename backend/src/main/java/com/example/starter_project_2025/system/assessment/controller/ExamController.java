package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.system.assessment.dto.assessment.response.AssessmentDTO;
import com.example.starter_project_2025.system.assessment.dto.assessment.request.CreateAssessmentRequest;
import com.example.starter_project_2025.system.assessment.dto.assessment.request.UpdateAssessmentRequest;
import com.example.starter_project_2025.system.assessment.enums.AssessmentDifficulty;
import com.example.starter_project_2025.system.assessment.enums.AssessmentStatus;
import com.example.starter_project_2025.system.assessment.service.assessment.AssessmentService;
import com.example.starter_project_2025.system.assessment.service.impl.SubmissionServiceImpl;
import io.swagger.v3.oas.annotations.tags.Tag; // Thêm import này
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/assessment")
@RequiredArgsConstructor
@Tag(name = "Exam Controller", description = "API Quản lý bài kiểm tra (Đã đổi tên)") // Đánh dấu cho Swagger
public class ExamController {

    private final AssessmentService assessmentService;
    private final SubmissionServiceImpl submissionService;

    @PostMapping
    public ResponseEntity<AssessmentDTO> create(@Valid @RequestBody CreateAssessmentRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(assessmentService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssessmentDTO> update(@PathVariable Long id, @Valid @RequestBody UpdateAssessmentRequest request) {
        return ResponseEntity.ok(assessmentService.update(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssessmentDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(assessmentService.getById(id));
    }

    @GetMapping
    public ResponseEntity<Page<AssessmentDTO>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) AssessmentStatus status,
            @RequestParam(required = false) Long assessmentTypeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate createdFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate createdTo,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        return ResponseEntity.ok(
                assessmentService.search(keyword, status, assessmentTypeId, createdFrom, createdTo, pageable)
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        assessmentService.delete(id);
    }

    @GetMapping("/status")
    public ResponseEntity<AssessmentDTO> getByStatus(
            @RequestParam AssessmentStatus status) {

        return ResponseEntity.ok(
                assessmentService.findByStatus(status)
        );
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AssessmentDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam AssessmentStatus status) {

        return ResponseEntity.ok(
                assessmentService.updateStatus(id, status)
        );
    }

    @GetMapping("/difficulty")
    public ResponseEntity<Page<AssessmentDTO>> getByDifficulty(
            @RequestParam AssessmentDifficulty difficulty,
            Pageable pageable
    ) {
        return ResponseEntity.ok(
                assessmentService.findByDifficulty(difficulty, pageable)
        );
    }
}