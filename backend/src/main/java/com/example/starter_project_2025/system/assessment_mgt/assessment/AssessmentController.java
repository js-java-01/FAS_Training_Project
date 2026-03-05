package com.example.starter_project_2025.system.assessment_mgt.assessment;


import com.example.starter_project_2025.base.crud.BaseCrudDataIoController;
import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import com.example.starter_project_2025.base.crud.CrudService;
import com.example.starter_project_2025.system.assessment_mgt.assessment_type.AssessmentType;
import com.example.starter_project_2025.system.assessment_mgt.assessment_type.AssessmentTypeDTO;
import com.example.starter_project_2025.system.assessment_mgt.assessment_type.AssessmentTypeFilter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/assessment")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Assessment  Management", description = "APIs for managing assessment")
public class AssessmentController extends BaseCrudDataIoController<Assessment, UUID, AssessmentDTO, AssessmentFilter> {

    AssessmentService assessmentService;
    AssessmentRepository assessmentRepository;

    @Override
    protected BaseCrudRepository<Assessment, UUID> getRepository() {
        return assessmentRepository;
    }

    @Override
    protected Class<Assessment> getEntityClass() {
        return Assessment.class;
    }

    @Override
    protected CrudService<UUID, AssessmentDTO, AssessmentFilter> getService() {
        return assessmentService;
    }
}
