package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.system.assessment.dto.assessmentquestion.AddQuestionToExamDTO;
import com.example.starter_project_2025.system.assessment.entity.AssessmentQuestion;
import com.example.starter_project_2025.system.assessment.service.assessmentquestion.AssessmentQuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/assessment-questions")
@RequiredArgsConstructor
public class AssessmentQuestionController {

    private final AssessmentQuestionService service;

    // API để thêm câu hỏi vào đề thi
    @PostMapping
    public ResponseEntity<?> addQuestionToAssessment(@RequestBody AddQuestionToExamDTO dto) {
        AssessmentQuestion result = service.addQuestionToExam(dto);
        // Trả về ID của mối liên kết vừa tạo là đủ
        return ResponseEntity.ok("Thêm thành công! ID liên kết: " + result.getId());
    }
}