package com.example.starter_project_2025.system.assessment_mgt.submission_answer;

import com.example.starter_project_2025.base.crud.dto.FilterOperator;
import com.example.starter_project_2025.base.spec.FilterField;

import java.util.List;
import java.util.UUID;

public record SubmissionAnswerFilter(
        @FilterField(entityField = "submission.id")
        UUID submissionId,

        @FilterField(entityField = "submissionQuestion.id")
        UUID submissionQuestionId,

        @FilterField(entityField = "isCorrect")
        Boolean isCorrect,

        @FilterField(entityField = "score", operator = FilterOperator.BETWEEN)
        List<Double> scoreRange

)
{

}
