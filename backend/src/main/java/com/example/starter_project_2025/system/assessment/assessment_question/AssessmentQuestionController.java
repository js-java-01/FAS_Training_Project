package com.example.starter_project_2025.system.assessment.assessment_question;

import com.example.starter_project_2025.base.controller.BaseCrudDataIoController;
import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import com.example.starter_project_2025.base.service.CrudService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/assessment-questions")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Assessment Question", description = "APIs for managing assessment Question")
public class AssessmentQuestionController
            extends BaseCrudDataIoController<AssessmentQuestion, UUID, AssessmentQuestionDTO, AssessmentQuestionFilter> {

    AssessmentQuestionService assessmentQuestionService;
    AssessmentQuestionRepository assessmentQuestionRepository;

    @Override
    protected CrudService<UUID, AssessmentQuestionDTO, AssessmentQuestionFilter> getService() {
        return assessmentQuestionService;
    }

    @Override
    protected BaseCrudRepository<AssessmentQuestion, UUID> getRepository() {
        return assessmentQuestionRepository;
    }

    @Override
    protected Class<AssessmentQuestion> getEntityClass() {
        return AssessmentQuestion.class;
    }
}
