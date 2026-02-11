package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.system.assessment.dto.assessmentquestion.AddQuestionToExamDTO;
import com.example.starter_project_2025.system.assessment.entity.AssessmentQuestion;
import com.example.starter_project_2025.system.assessment.service.assessmentquestion.AssessmentQuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/assessment-questions")
@RequiredArgsConstructor
@Tag(name = "Assessment Question", description = "CRUD APIs for assessment questions")
public class AssessmentQuestionController {

    private final AssessmentQuestionService service;

    @Operation(summary = "Add question to assessment")
    @PostMapping
    public ResponseEntity<AssessmentQuestion> addQuestionToAssessment(
            @RequestBody AddQuestionToExamDTO dto
    ) {
        return ResponseEntity.ok(service.addQuestionToExam(dto));
    }

    @GetMapping("/assessment/{assessmentId}")
    public ResponseEntity<List<AssessmentQuestion>> getByAssessmentId(
            @PathVariable Long assessmentId
    ) {
        return ResponseEntity.ok(service.getByAssessmentId(assessmentId));
    }

    @Operation(summary = "Get all assessment questions")
    @GetMapping
    public ResponseEntity<List<AssessmentQuestion>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @Operation(summary = "Delete assessment question by id")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }
}
