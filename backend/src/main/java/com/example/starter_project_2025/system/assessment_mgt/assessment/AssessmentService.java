package com.example.starter_project_2025.system.assessment_mgt.assessment;

import com.example.starter_project_2025.base.crud.CrudService;
import com.example.starter_project_2025.system.assessment_mgt.assessment_type.AssessmentTypeFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

public interface AssessmentService extends CrudService<UUID, AssessmentDTO, AssessmentFilter> {
}
