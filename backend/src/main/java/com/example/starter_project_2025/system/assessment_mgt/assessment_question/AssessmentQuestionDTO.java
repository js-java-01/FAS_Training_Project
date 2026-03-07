package com.example.starter_project_2025.system.assessment_mgt.assessment_question;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AssessmentQuestionDTO {

    UUID id;

    UUID assessmentId;

    UUID questionId;

    Double score;

    Integer orderIndex;

}
