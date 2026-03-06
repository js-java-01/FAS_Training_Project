package com.example.starter_project_2025.system.assessment_mgt.assessment_question;

import com.example.starter_project_2025.base.crud.BaseCrudMapper;
import com.example.starter_project_2025.system.assessment_mgt.assessment_question_option.AssessmentQuestionOptionMapper;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {AssessmentQuestionOptionMapper.class})
public interface AssessmentQuestionMapper
        extends BaseCrudMapper<AssessmentQuestion, AssessmentQuestionDTO> {

    @Override
    @Mapping(target = "assessmentId", source = "assessment.id")
    @Mapping(target = "questionId", source = "question.id")
    @Mapping(target = "options", source = "options")
    AssessmentQuestionDTO toResponse(AssessmentQuestion entity);

    @Override
    @Mapping(target = "assessment", ignore = true)
    @Mapping(target = "question", ignore = true)
    @Mapping(target = "options", ignore = true)
    AssessmentQuestion toEntity(AssessmentQuestionDTO dto);

    @Override
    @Mapping(target = "assessment", ignore = true)
    @Mapping(target = "question", ignore = true)
    @Mapping(target = "options", ignore = true)
    void update(@MappingTarget AssessmentQuestion entity, AssessmentQuestionDTO dto);

}
