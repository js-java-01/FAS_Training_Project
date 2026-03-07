package com.example.starter_project_2025.system.assessment_mgt.question_category;

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
@RequestMapping("/api/question-categories")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Question Category", description = "APIs for managing question categories")
public class QuestionCategoryController
        extends BaseCrudDataIoController<QuestionCategory, UUID, QuestionCategoryDTO, QuestionCategoryFilter> {

    QuestionCategoryService questionCategoryService;
    QuestionCategoryRepository questionCategoryRepository;

    @Override
    protected CrudService<UUID, QuestionCategoryDTO, QuestionCategoryFilter> getService() {
        return questionCategoryService;
    }

    @Override
    protected BaseCrudRepository<QuestionCategory, UUID> getRepository() {
        return questionCategoryRepository;
    }

    @Override
    protected Class<QuestionCategory> getEntityClass() {
        return QuestionCategory.class;
    }

}