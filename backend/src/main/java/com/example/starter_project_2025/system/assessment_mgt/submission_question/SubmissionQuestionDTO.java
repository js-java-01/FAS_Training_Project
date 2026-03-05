package com.example.starter_project_2025.system.assessment_mgt.submission_question;

import com.example.starter_project_2025.base.crud.dto.CrudDto;
import com.example.starter_project_2025.system.assessment_mgt.question.QuestionType;
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
public class SubmissionQuestionDTO implements CrudDto<UUID> {
    UUID id;

    UUID submissionId;

    UUID originalQuestionId;

    String content;

    QuestionType questionType;

    Double score;

    Integer orderIndex;

    List<UUID> answerIds;
}
