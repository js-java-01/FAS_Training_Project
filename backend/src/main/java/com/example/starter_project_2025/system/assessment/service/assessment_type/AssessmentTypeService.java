package com.example.starter_project_2025.system.assessment.service.assessment_type;

import com.example.starter_project_2025.base.service.CrudService;
import com.example.starter_project_2025.system.assessment.dto.assessment_type.AssessmentTypeDTO;
import com.example.starter_project_2025.system.assessment.dto.assessment_type.AssessmentTypeFilter;

import java.util.UUID;

public interface AssessmentTypeService extends CrudService<UUID, AssessmentTypeDTO, AssessmentTypeFilter> {
}
