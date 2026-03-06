package com.example.starter_project_2025.system.assessment_mgt.assessment_question_option;

import com.example.starter_project_2025.base.crud.BaseCrudMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AssessmentQuestionOptionMapper
        extends BaseCrudMapper<AssessmentQuestionOption, AssessmentQuestionOptionDTO> {

    @Override
    @Mapping(target = "assessmentQuestionId", source = "assessmentQuestion.id")
    AssessmentQuestionOptionDTO toResponse(AssessmentQuestionOption entity);

    @Override
    @Mapping(target = "assessmentQuestion", ignore = true)
    AssessmentQuestionOption toEntity(AssessmentQuestionOptionDTO dto);

    @Override
    @Mapping(target = "assessmentQuestion", ignore = true)
    void update(@MappingTarget AssessmentQuestionOption entity, AssessmentQuestionOptionDTO dto);
}