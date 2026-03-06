package com.example.starter_project_2025.system.assessment.question_tag;

import com.example.starter_project_2025.base.mapper.BaseCrudMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface QuestionTagMapper extends BaseCrudMapper<QuestionTag, QuestionTagDTO> {
}
