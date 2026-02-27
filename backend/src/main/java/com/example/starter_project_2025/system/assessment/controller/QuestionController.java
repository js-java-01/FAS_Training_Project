package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.system.assessment.dto.question.request.QuestionRequestDTO;
import com.example.starter_project_2025.system.assessment.dto.question.request.UpdateQuestionRequestDTO;
import com.example.starter_project_2025.system.assessment.dto.question.response.QuestionResponseDTO;
import com.example.starter_project_2025.system.assessment.entity.Question;
import com.example.starter_project_2025.system.assessment.service.question.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @PostMapping
    public ResponseEntity<QuestionResponseDTO> createQuestion(
            @Valid @RequestBody QuestionRequestDTO dto
    ) {
        return ResponseEntity.ok(questionService.createQuestion(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuestionResponseDTO> getQuestionById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }

    @GetMapping
    public Page<QuestionResponseDTO> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String questionType,
            @RequestParam(required = false) List<Long> tagIds,
            Pageable pageable
    ) {
        return questionService.search(
                keyword, categoryId, questionType, tagIds, pageable
        );
    }

    @PatchMapping("/{id}")
    public ResponseEntity<QuestionResponseDTO> updateQuestion(
            @PathVariable UUID id,
            @RequestBody UpdateQuestionRequestDTO dto
    ) {
        return ResponseEntity.ok(questionService.updateQuestion(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable UUID id) {
        questionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }


}
