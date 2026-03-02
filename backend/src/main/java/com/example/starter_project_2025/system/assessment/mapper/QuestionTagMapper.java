package com.example.starter_project_2025.system.assessment.mapper;

import com.example.starter_project_2025.base.mapper.BaseCrudMapper;
import com.example.starter_project_2025.system.assessment.dto.question_tag.QuestionTagDTO;
import com.example.starter_project_2025.system.assessment.entity.QuestionTag;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface QuestionTagMapper extends BaseCrudMapper<QuestionTag, QuestionTagDTO> {
}
