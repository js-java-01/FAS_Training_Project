package com.example.starter_project_2025.system.assessment_mgt.submission_answer;


import com.example.starter_project_2025.base.crud.dto.CrudDto;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SubmissionAnswerDTO implements CrudDto<UUID> {

    UUID id;

    UUID submissionId;

    UUID submissionQuestionId;

    String answerValue;

    Boolean isCorrect;

    Double score;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;
}
