package com.example.starter_project_2025.system.assessment_mgt.assessment_question_option;

import com.example.starter_project_2025.base.crud.BaseCrudDataIoController;
import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import com.example.starter_project_2025.base.crud.CrudService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/assessment-question-options")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Assessment Question Option Management", description = "APIs for managing assessment question options")
public class AssessmentQuestionOptionController
        extends
        BaseCrudDataIoController<AssessmentQuestionOption, UUID, AssessmentQuestionOptionDTO, AssessmentQuestionOptionFilter> {

    AssessmentQuestionOptionService assessmentQuestionOptionService;
    AssessmentQuestionOptionRepository assessmentQuestionOptionRepository;

    @Override
    protected BaseCrudRepository<AssessmentQuestionOption, UUID> getRepository() {
        return assessmentQuestionOptionRepository;
    }

    @Override
    protected Class<AssessmentQuestionOption> getEntityClass() {
        return AssessmentQuestionOption.class;
    }

    @Override
    protected CrudService<UUID, AssessmentQuestionOptionDTO, AssessmentQuestionOptionFilter> getService() {
        return assessmentQuestionOptionService;
    }
}
