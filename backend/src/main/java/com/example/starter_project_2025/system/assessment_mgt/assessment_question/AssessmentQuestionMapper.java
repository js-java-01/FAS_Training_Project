<<<<<<<< HEAD:backend/src/main/java/com/example/starter_project_2025/system/assessment/assessment_question/AssessmentQuestionMapper.java
package com.example.starter_project_2025.system.assessment.assessment_question;

import com.example.starter_project_2025.base.mapper.BaseCrudMapper;
========
package com.example.starter_project_2025.system.assessment_mgt.assessment_question;

import com.example.starter_project_2025.base.crud.BaseCrudMapper;
>>>>>>>> 969201241eddad103d8fabc8223f98735ac13075:backend/src/main/java/com/example/starter_project_2025/system/assessment_mgt/assessment_question/AssessmentQuestionMapper.java
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface AssessmentQuestionMapper
        extends BaseCrudMapper<AssessmentQuestion, AssessmentQuestionDTO> {

    @Override
    @Mapping(target = "assessmentId", source = "assessment.id")
    @Mapping(target = "questionId", source = "question.id")
    AssessmentQuestionDTO toResponse(AssessmentQuestion entity);

    @Override
    @Mapping(target = "assessment", ignore = true)
    @Mapping(target = "question", ignore = true)
    AssessmentQuestion toEntity(AssessmentQuestionDTO dto);

    @Override
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "assessment", ignore = true)
    @Mapping(target = "question", ignore = true)
    void update(@MappingTarget AssessmentQuestion entity,
                AssessmentQuestionDTO dto);
}
