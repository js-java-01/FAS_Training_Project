package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.base.controller.BaseCrudDataIoController;
import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import com.example.starter_project_2025.base.service.CrudService;
import com.example.starter_project_2025.system.assessment.dto.question.request.UpdateQuestionOptionDTO;
import com.example.starter_project_2025.system.assessment.dto.question_option.QuestionOptionDTO;
import com.example.starter_project_2025.system.assessment.dto.question_option.QuestionOptionFilter;
import com.example.starter_project_2025.system.assessment.entity.QuestionOption;
import com.example.starter_project_2025.system.assessment.repository.QuestionOptionRepository;
import com.example.starter_project_2025.system.assessment.service.question_option.QuestionOptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/question-options")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Question Option Management", description = "APIs for managing question options")
public class QuestionOptionController
        extends BaseCrudDataIoController<QuestionOption, UUID, QuestionOptionDTO, QuestionOptionFilter> {

    QuestionOptionService questionOptionService;
    QuestionOptionRepository questionOptionRepository;

    @Override
    protected BaseCrudRepository<QuestionOption, UUID> getRepository() {
        return questionOptionRepository;
    }

    @Override
    protected Class<QuestionOption> getEntityClass() {
        return QuestionOption.class;
    }

    @Override
    protected CrudService<UUID, QuestionOptionDTO, QuestionOptionFilter> getService() {
        return questionOptionService;
    }
}
