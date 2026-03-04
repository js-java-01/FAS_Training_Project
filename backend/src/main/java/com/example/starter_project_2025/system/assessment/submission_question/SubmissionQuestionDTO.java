package com.example.starter_project_2025.system.assessment.submission_question;

import com.example.starter_project_2025.system.assessment.question_option.QuestionOptionDTO;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class SubmissionQuestionDTO {

    UUID id;

    String content;

    String questionType;

    Double maxScore;

    Integer orderIndex;

    List<QuestionOptionDTO> options;
}
