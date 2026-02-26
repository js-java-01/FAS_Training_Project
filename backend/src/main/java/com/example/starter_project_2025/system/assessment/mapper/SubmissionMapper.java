package com.example.starter_project_2025.system.assessment.mapper;

import com.example.starter_project_2025.system.assessment.dto.submission.response.SubmissionQuestionResponse;
import com.example.starter_project_2025.system.assessment.dto.submission.response.SubmissionResponse;
import com.example.starter_project_2025.system.assessment.dto.submission.response.SubmissionResultResponse;
import com.example.starter_project_2025.system.assessment.entity.Submission;
import com.example.starter_project_2025.system.assessment.entity.SubmissionAnswer;
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

    @Mapping(source = "assessment.passScore", target = "passScore")
    @Mapping(source = "id", target = "submissionId")
    SubmissionResultResponse toSubmissionResultResponse(Submission submission);

    // Basic mapping for SubmissionQuestion (without options - will be added by service)
    @Mapping(source = "questionType", target = "questionType", qualifiedByName = "mapQuestionType")
    @Mapping(source = "submissionAnswers", target = "isCorrect", qualifiedByName = "mapIsCorrect")
    @Mapping(source = "submissionAnswers", target = "userAnswer", qualifiedByName = "mapUserAnswer")
    SubmissionQuestionResponse toSubmissionQuestionResponse(SubmissionQuestion submissionQuestion);

    @org.mapstruct.Named("mapQuestionType")
    default String mapQuestionType(com.example.starter_project_2025.system.assessment.enums.QuestionType questionType) {
        return questionType != null ? questionType.name() : null;
    }

    @org.mapstruct.Named("mapIsCorrect")
    default Boolean mapIsCorrect(List<SubmissionAnswer> answers) {
        if (answers == null || answers.isEmpty()) {
            return null;
        }
        return answers.get(0).getIsCorrect();
    }

    @org.mapstruct.Named("mapUserAnswer")
    default String mapUserAnswer(List<SubmissionAnswer> answers) {
        if (answers == null || answers.isEmpty()) {
            return null;
        }
        return answers.get(0).getAnswerValue();
    }
}