package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.base.controller.BaseCrudDataIoController;
import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import com.example.starter_project_2025.base.service.CrudService;
import com.example.starter_project_2025.system.assessment.dto.assessment_question.AssessmentQuestionDTO;
import com.example.starter_project_2025.system.assessment.dto.assessment_question.AssessmentQuestionFilter;
import com.example.starter_project_2025.system.assessment.entity.AssessmentQuestion;
import com.example.starter_project_2025.system.assessment.repository.AssessmentQuestionRepository;
import com.example.starter_project_2025.system.assessment.service.assessment_question.AssessmentQuestionService;
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
@Tag(name = "assessment-question", description = "APIs for managing Assessment Question")
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
