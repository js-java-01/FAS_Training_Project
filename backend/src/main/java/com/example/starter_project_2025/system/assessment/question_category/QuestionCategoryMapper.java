package com.example.starter_project_2025.system.assessment.question_category;

import com.example.starter_project_2025.base.mapper.BaseCrudMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface QuestionCategoryMapper  extends BaseCrudMapper<QuestionCategory, QuestionCategoryDTO> {
}
