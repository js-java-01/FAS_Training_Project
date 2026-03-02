package com.example.starter_project_2025.system.assessment.service.question_tag;

import com.example.starter_project_2025.base.service.CrudService;
import com.example.starter_project_2025.system.assessment.dto.question_tag.QuestionTagDTO;
import com.example.starter_project_2025.system.assessment.dto.question_tag.QuestionTagFilter;
import com.example.starter_project_2025.system.assessment.dto.question_tag.response.TagCountResponse;

import java.util.List;
import java.util.UUID;

public interface QuestionTagService extends CrudService<Long, QuestionTagDTO, QuestionTagFilter> {
    List<TagCountResponse> getTagsByCategory(UUID categoryId);
}
