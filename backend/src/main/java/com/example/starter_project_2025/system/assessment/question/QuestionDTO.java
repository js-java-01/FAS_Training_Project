package com.example.starter_project_2025.system.assessment.question;

import com.example.starter_project_2025.system.assessment.question_option.QuestionOptionDTO;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuestionDTO {

    UUID id;

    String content;

    String questionType;

    Boolean isActive;

    UUID categoryId;

    Set<Long> tagIds;

    List<QuestionOptionDTO> options;

    LocalDate createdAt;
    LocalDate updatedAt;
}