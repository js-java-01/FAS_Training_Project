package com.example.starter_project_2025.system.assessment.assessment;

import com.example.starter_project_2025.base.controller.BaseCrudDataIoController;
import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import com.example.starter_project_2025.base.service.CrudService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/assessments")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Assessment", description = "APIs for managing assessments")
public class AssessmentController
        extends BaseCrudDataIoController<Assessment, UUID, AssessmentDTO, AssessmentFilter> {

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
