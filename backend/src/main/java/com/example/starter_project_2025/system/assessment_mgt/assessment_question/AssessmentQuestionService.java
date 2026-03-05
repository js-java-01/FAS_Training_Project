package com.example.starter_project_2025.system.assessment_mgt.assessment_question;

import com.example.starter_project_2025.base.crud.CrudService;

import java.util.List;
import java.util.UUID;

public interface AssessmentQuestionService extends CrudService<UUID, AssessmentQuestionDTO, AssessmentQuestionFilter> {
    public List<AssessmentQuestionDTO> getByAssessmentId(UUID assessmentId);
}
