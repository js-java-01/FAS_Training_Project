package com.example.starter_project_2025.system.assessment_mgt.assessment_question;

import com.example.starter_project_2025.base.crud.BaseCrudMapper;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface AssessmentQuestionMapper
        extends BaseCrudMapper<AssessmentQuestion, AssessmentQuestionDTO> {


}
