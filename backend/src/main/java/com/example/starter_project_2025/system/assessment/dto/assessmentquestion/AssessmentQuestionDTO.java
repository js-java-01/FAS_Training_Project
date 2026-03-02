package com.example.starter_project_2025.system.assessment.dto.assessmentquestion;

import com.example.starter_project_2025.base.dto.CrudDto;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AssessmentQuestionDTO implements CrudDto<UUID>{

    UUID id;

    Long assessmentId;

    UUID questionId;

    Double score;

    Integer orderIndex;

}
