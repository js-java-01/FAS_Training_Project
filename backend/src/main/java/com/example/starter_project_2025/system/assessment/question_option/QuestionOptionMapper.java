package com.example.starter_project_2025.system.assessment.question_option;

import com.example.starter_project_2025.base.mapper.BaseCrudMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface QuestionOptionMapper  extends BaseCrudMapper<QuestionOption, QuestionOptionDTO> {
}
