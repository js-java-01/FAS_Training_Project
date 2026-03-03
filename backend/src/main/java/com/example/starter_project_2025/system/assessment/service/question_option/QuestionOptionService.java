package com.example.starter_project_2025.system.assessment.service.question_option;

import com.example.starter_project_2025.base.service.CrudService;
import com.example.starter_project_2025.system.assessment.dto.question_option.QuestionOptionDTO;
import com.example.starter_project_2025.system.assessment.dto.question_option.QuestionOptionFilter;

import java.util.UUID;

public interface QuestionOptionService extends CrudService<UUID, QuestionOptionDTO, QuestionOptionFilter>{
}
