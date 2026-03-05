package com.example.starter_project_2025.system.assessment_mgt.submission_question;

import com.example.starter_project_2025.base.spec.FilterField;
import lombok.Builder;

import java.util.UUID;

@Builder
public record SubmissionQuestionFilter(

        @FilterField(entityField = "submission.id")
        UUID submissionId,

        @FilterField(entityField = "originalQuestionId")
        UUID originalQuestionId
){}
