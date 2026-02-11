package com.example.starter_project_2025.system.assessment.dto.category;

import lombok.Data;
import java.util.UUID;

@Data
public class QuestionCategoryDTO {
    private UUID id;
    private String name;
    private String description;
}