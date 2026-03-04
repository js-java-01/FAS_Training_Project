package com.example.starter_project_2025.system.assessment_mgt.question;

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
