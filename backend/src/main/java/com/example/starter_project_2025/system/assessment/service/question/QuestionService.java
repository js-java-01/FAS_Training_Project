package com.example.starter_project_2025.system.assessment.service.question;

import com.example.starter_project_2025.base.service.CrudService;
import com.example.starter_project_2025.system.assessment.dto.question.QuestionDTO;
import com.example.starter_project_2025.system.assessment.dto.question.QuestionFilter;

import java.util.UUID;

public interface QuestionService extends CrudService<UUID, QuestionDTO, QuestionFilter> {
}
