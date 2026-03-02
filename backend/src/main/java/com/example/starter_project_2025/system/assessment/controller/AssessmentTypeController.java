package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.base.controller.BaseCrudDataIoController;
import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import com.example.starter_project_2025.base.service.CrudService;
import com.example.starter_project_2025.system.assessment.dto.assessment_type.AssessmentTypeDTO;
import com.example.starter_project_2025.system.assessment.dto.assessment_type.AssessmentTypeFilter;
import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import com.example.starter_project_2025.system.assessment.service.assessment_type.AssessmentTypeServiceImpl;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/assessment-types")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Assessment Type Management", description = "APIs for managing assessment type")
public class AssessmentTypeController
        extends BaseCrudDataIoController<AssessmentType, UUID, AssessmentTypeDTO, AssessmentTypeFilter> {

    AssessmentTypeServiceImpl assessService;
    AssessmentTypeRepository assessmentTypeRepository;

    @Override
    protected BaseCrudRepository<AssessmentType, UUID> getRepository() {
        return assessmentTypeRepository;
    }

    @Override
    protected Class<AssessmentType> getEntityClass() {
        return AssessmentType.class;
    }

    @Override
    protected CrudService<UUID, AssessmentTypeDTO, AssessmentTypeFilter> getService() {
        return assessService;
    }
}
