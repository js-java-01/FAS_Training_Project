package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.system.assessment.dto.AssessmentDTO;
import com.example.starter_project_2025.system.assessment.dto.CreateAssessmentRequest;
import com.example.starter_project_2025.system.assessment.dto.UpdateAssessmentRequest;
import com.example.starter_project_2025.system.assessment.dto.UserAssessmentDTO;
import com.example.starter_project_2025.system.assessment.enums.AssessmentStatus;
import com.example.starter_project_2025.system.assessment.service.AssessmentService;
import com.example.starter_project_2025.system.assessment.service.SubmissionService;
import com.example.starter_project_2025.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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
@Tag(name = "Exam Controller", description = "API Quản lý bài kiểm tra (Đã đổi tên)") // Đánh dấu cho Swagger
public class ExamController {

    private final AssessmentService assessmentService;
    private final SubmissionService submissionService;

    public ExamController(AssessmentService assessmentService, SubmissionService submissionService) {
        this.assessmentService = assessmentService;
        this.submissionService = submissionService;
        System.out.println("=================================================");
        System.out.println("!!! DA KHOI DONG EXAM CONTROLLER THANH CONG !!!");
        System.out.println("=================================================");
    }

    // ==================== GET USER ASSESSMENTS ====================
    @GetMapping("/user/me")
    public ResponseEntity<List<UserAssessmentDTO>> getMyAssessments(
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        return ResponseEntity.ok(submissionService.getUserAssessments(currentUser.getId()));
    }

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

    // 🔄 Update status
    @PutMapping("/{id}/status")
    public ResponseEntity<AssessmentDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam AssessmentStatus status) {

        return ResponseEntity.ok(
                assessmentService.updateStatus(id, status)
        );
    }
}