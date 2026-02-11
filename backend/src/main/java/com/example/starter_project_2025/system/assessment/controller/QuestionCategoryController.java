package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.system.assessment.dto.category.QuestionCategoryDTO;
import com.example.starter_project_2025.system.assessment.entity.QuestionCategory;
import com.example.starter_project_2025.system.assessment.service.category.QuestionCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/question-categories")
@RequiredArgsConstructor
public class QuestionCategoryController {

    private final QuestionCategoryService categoryService;

    // 1. Lấy tất cả danh mục
    @GetMapping
    public ResponseEntity<List<QuestionCategory>> getAll() {
        return ResponseEntity.ok(categoryService.getAll());
    }

    // 2. Tạo danh mục mới
    @PostMapping
    public ResponseEntity<QuestionCategory> create(@RequestBody QuestionCategoryDTO dto) {
        return ResponseEntity.ok(categoryService.create(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteById(@PathVariable UUID id) {
        categoryService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(categoryService.getById(id));
    }
}