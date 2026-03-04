package com.example.starter_project_2025.system.assessment.question_category;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuestionCategoryDTO {

    UUID id;

    String name;

    String description;

    LocalDate createdAt;

    LocalDate updatedAt;
}