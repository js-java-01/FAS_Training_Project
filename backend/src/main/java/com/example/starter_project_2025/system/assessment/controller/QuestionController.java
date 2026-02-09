package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.system.assessment.dto.question.QuestionRequestDTO;
import com.example.starter_project_2025.system.assessment.entity.Question;
import com.example.starter_project_2025.system.assessment.service.question.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    // Tạo câu hỏi mới (Kèm cả Options)
    @PostMapping
    public ResponseEntity<Question> createQuestion(@RequestBody QuestionRequestDTO dto) {
        return ResponseEntity.ok(questionService.createQuestion(dto));
    }
    
    // Ông có thể thêm API Get, Delete ở đây sau
}