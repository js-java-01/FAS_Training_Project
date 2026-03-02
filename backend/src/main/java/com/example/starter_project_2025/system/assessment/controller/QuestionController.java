package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.base.controller.BaseCrudDataIoController;
import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import com.example.starter_project_2025.base.service.CrudService;
import com.example.starter_project_2025.system.assessment.dto.question.QuestionDTO;
import com.example.starter_project_2025.system.assessment.dto.question.QuestionFilter;
import com.example.starter_project_2025.system.assessment.dto.question.request.QuestionRequestDTO;
import com.example.starter_project_2025.system.assessment.dto.question.request.UpdateQuestionRequestDTO;
import com.example.starter_project_2025.system.assessment.dto.question.response.QuestionResponseDTO;
import com.example.starter_project_2025.system.assessment.entity.Question;
import com.example.starter_project_2025.system.assessment.repository.QuestionRepository;
import com.example.starter_project_2025.system.assessment.service.question.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/questions")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Question Management", description = "APIs for managing questions")
public class QuestionController
        extends BaseCrudDataIoController<Question, UUID, QuestionDTO, QuestionFilter> {

    QuestionService questionService;
    QuestionRepository questionRepository;

    @Override
    protected BaseCrudRepository<Question, UUID> getRepository() {
        return questionRepository;
    }

    @Override
    protected Class<Question> getEntityClass() {
        return Question.class;
    }

    @Override
    protected CrudService<UUID, QuestionDTO, QuestionFilter> getService() {
        return questionService;
    }
}
