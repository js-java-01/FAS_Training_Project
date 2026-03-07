package com.example.starter_project_2025.system.assessment_mgt.submission_question_option;

import com.example.starter_project_2025.base.crud.BaseCrudMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface SubmissionQuestionOptionMapper
        extends BaseCrudMapper<SubmissionQuestionOption, SubmissionQuestionOptionDTO> {

    @Override
    @Mapping(target = "submissionQuestionId", source = "submissionQuestion.id")
    SubmissionQuestionOptionDTO toResponse(SubmissionQuestionOption entity);

    @Override
    @Mapping(target = "submissionQuestion", ignore = true)
    SubmissionQuestionOption toEntity(SubmissionQuestionOptionDTO dto);

    @Override
    @Mapping(target = "submissionQuestion", ignore = true)
    void update(@MappingTarget SubmissionQuestionOption entity, SubmissionQuestionOptionDTO dto);
}
