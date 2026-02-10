package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.system.assessment.dto.question.QuestionRequestDTO;
import com.example.starter_project_2025.system.assessment.dto.question.UpdateQuestionRequestDTO;
import com.example.starter_project_2025.system.assessment.entity.Question;
import com.example.starter_project_2025.system.assessment.service.question.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/questions")
@RequiredArgsConstructor
@Tag(name = "Question", description = "APIs for managing questions")
public class QuestionController {

    private final QuestionService questionService;

    @Operation(summary = "Create a new question with options")
    @PostMapping
    public ResponseEntity<Question> createQuestion(
            @RequestBody QuestionRequestDTO dto
    ) {
        return ResponseEntity.ok(questionService.createQuestion(dto));
    }

    @Operation(summary = "Get all questions")
    @GetMapping
    public ResponseEntity<List<Question>> getAllQuestions() {
        return ResponseEntity.ok(questionService.getAll());
    }

    @Operation(summary = "Delete question by id")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable UUID id) {
        questionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Update question by id")
    @PutMapping("/{id}")
    public ResponseEntity<Question> updateQuestion(@PathVariable UUID id, @RequestBody UpdateQuestionRequestDTO dto
    ) {
        return ResponseEntity.ok(questionService.updateQuestion(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getQuestionById(@PathVariable UUID id) {
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }


}
