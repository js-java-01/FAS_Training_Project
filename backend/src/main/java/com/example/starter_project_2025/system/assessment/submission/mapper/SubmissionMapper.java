package com.example.starter_project_2025.system.assessment.submission.mapper;

import com.example.starter_project_2025.system.assessment.submission.dto.response.SubmissionQuestionResponse;
import com.example.starter_project_2025.system.assessment.submission.dto.response.SubmissionResponse;
import com.example.starter_project_2025.system.assessment.submission.dto.response.SubmissionResultResponse;
import com.example.starter_project_2025.system.assessment.submission.entity.Submission;
import com.example.starter_project_2025.system.assessment.submission.entity.SubmissionQuestion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SubmissionMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "assessmentType.id", target = "assessmentId")
    SubmissionResponse toSubmissionResponse(Submission submission);

    List<SubmissionResponse> toSubmissionResponses(List<Submission> submissions);

    SubmissionQuestionResponse toSubmissionQuestionResponse(
            SubmissionQuestion submissionQuestion
    );

    List<SubmissionQuestionResponse> toSubmissionQuestionResponses(
            List<SubmissionQuestion> submissionQuestions
    );

    SubmissionResultResponse toSubmissionResultResponse(Submission submission);
}