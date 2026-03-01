package com.example.starter_project_2025.system.assessment.dto.assessmentType.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AssessmentTypeResponse {
    String id;
    String name;
    String description;
    LocalDate createdAt;
    LocalDate updatedAt;
}
