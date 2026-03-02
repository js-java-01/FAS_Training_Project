package com.example.starter_project_2025.system.assessment.mapper;

import com.example.starter_project_2025.base.mapper.BaseCrudMapper;
import com.example.starter_project_2025.system.assessment.dto.category.QuestionCategoryDTO;
import com.example.starter_project_2025.system.assessment.entity.QuestionCategory;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface QuestionCategoryMapper  extends BaseCrudMapper<QuestionCategory, QuestionCategoryDTO> {
}
