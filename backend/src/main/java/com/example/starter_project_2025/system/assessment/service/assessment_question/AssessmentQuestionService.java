package com.example.starter_project_2025.system.assessment.service.assessment_question;

import com.example.starter_project_2025.base.service.CrudService;
import com.example.starter_project_2025.system.assessment.dto.assessment_question.AssessmentQuestionDTO;
import com.example.starter_project_2025.system.assessment.dto.assessment_question.AssessmentQuestionFilter;

import java.util.UUID;

public interface AssessmentQuestionService extends CrudService<UUID, AssessmentQuestionDTO, AssessmentQuestionFilter> {
}
