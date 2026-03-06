package com.example.starter_project_2025.system.assessment_mgt.question_option;

import com.example.starter_project_2025.base.crud.BaseCrudMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface QuestionOptionMapper  extends BaseCrudMapper<QuestionOption, QuestionOptionDTO> {
}
