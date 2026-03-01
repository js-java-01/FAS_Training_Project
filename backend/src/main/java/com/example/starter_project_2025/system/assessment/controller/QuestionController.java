package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.system.assessment.dto.question.request.QuestionRequestDTO;
import com.example.starter_project_2025.system.assessment.dto.question.request.UpdateQuestionRequestDTO;
import com.example.starter_project_2025.system.assessment.dto.question.response.QuestionResponse;
import com.example.starter_project_2025.system.assessment.entity.Question;
import com.example.starter_project_2025.system.assessment.repository.QuestionRepository;
import com.example.starter_project_2025.system.assessment.service.question.QuestionService;
import com.example.starter_project_2025.system.dataio.core.common.FileFormat;
import com.example.starter_project_2025.system.dataio.core.exporter.service.ExportService;
import com.example.starter_project_2025.system.dataio.core.importer.result.ImportResult;
import com.example.starter_project_2025.system.dataio.core.importer.service.ImportService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/questions")
@RequiredArgsConstructor
@Tag(name = "Question", description = "APIs for managing questions")
public class QuestionController {

    private final QuestionService questionService;
    private final ExportService exportService;
    private final ImportService importService;
    private final QuestionRepository questionRepository;

    @PostMapping
    public ResponseEntity<QuestionResponse> createQuestion(
            @Valid @RequestBody QuestionRequestDTO dto
    ) {
        return ResponseEntity.ok(questionService.createQuestion(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuestionResponse> getQuestionById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }

    @GetMapping
    public Page<QuestionResponse> search(
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
    public ResponseEntity<QuestionResponse> updateQuestion(
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

    @GetMapping("/export")
    public void exportQuestions(
            @RequestParam(defaultValue = "EXCEL") FileFormat format,
            HttpServletResponse response
    ) throws IOException {
        exportService.export(
                format,
                questionRepository.findAll(),
                Question.class,
                response
        );
    }

    @PostMapping("/import")
    public ImportResult importQuestions(
            @RequestParam("file") MultipartFile file
    ) {
        return importService.importFile(
                file,
                Question.class,
                questionRepository
        );
    }


}
