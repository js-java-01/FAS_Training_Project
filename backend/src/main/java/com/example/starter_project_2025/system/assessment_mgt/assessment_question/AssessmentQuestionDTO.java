package com.example.starter_project_2025.system.assessment_mgt.assessment_question;

import com.example.starter_project_2025.base.crud.dto.CrudDto;
import com.example.starter_project_2025.system.assessment_mgt.assessment_question_option.AssessmentQuestionOptionDTO;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AssessmentQuestionDTO implements CrudDto<UUID>{

    UUID id;

    UUID assessmentId;

    UUID questionId;

    Double score;

    Integer orderIndex;

    List<AssessmentQuestionOptionDTO> options;

}
