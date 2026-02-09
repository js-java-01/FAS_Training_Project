package com.example.starter_project_2025.system.assessment.dto.assessmentquestion;

import lombok.Data;
import java.util.UUID;

@Data
public class AddQuestionToExamDTO {
    // 👇 SỬA DÒNG NÀY: Đổi UUID thành Long
    private Long assessmentId; 
    
    private UUID questionId; // Cái này của ông thì giữ nguyên UUID
    private Float score;
    private Integer orderIndex;
}