package com.example.starter_project_2025.system.assessment.dto.category;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuestionCategoryResponse {
    UUID id;
    String name;
    String description;
}