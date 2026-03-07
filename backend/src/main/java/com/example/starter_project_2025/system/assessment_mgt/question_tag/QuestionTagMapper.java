package com.example.starter_project_2025.system.assessment_mgt.question_tag;

import com.example.starter_project_2025.base.crud.BaseCrudMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface QuestionTagMapper extends BaseCrudMapper<QuestionTag, QuestionTagDTO> {
}
