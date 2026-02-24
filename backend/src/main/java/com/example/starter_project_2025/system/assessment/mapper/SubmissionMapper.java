package com.example.starter_project_2025.system.assessment.mapper;

import com.example.starter_project_2025.system.assessment.dto.submission.response.SubmissionQuestionResponse;
import com.example.starter_project_2025.system.assessment.dto.submission.response.SubmissionResponse;
import com.example.starter_project_2025.system.assessment.dto.submission.response.SubmissionResultResponse;
import com.example.starter_project_2025.system.assessment.entity.Submission;
import com.example.starter_project_2025.system.assessment.entity.SubmissionQuestion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SubmissionMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "assessment.id", target = "assessmentId")
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