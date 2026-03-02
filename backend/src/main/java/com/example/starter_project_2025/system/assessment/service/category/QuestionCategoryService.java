package com.example.starter_project_2025.system.assessment.service.category;

import com.example.starter_project_2025.base.service.CrudService;
import com.example.starter_project_2025.system.assessment.dto.category.QuestionCategoryDTO;
import com.example.starter_project_2025.system.assessment.dto.category.QuestionCategoryFilter;

import java.util.UUID;

public interface QuestionCategoryService extends CrudService<UUID, QuestionCategoryDTO, QuestionCategoryFilter> {
}
