package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.base.controller.BaseCrudDataIoController;
import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import com.example.starter_project_2025.base.service.CrudService;
import com.example.starter_project_2025.system.assessment.dto.category.QuestionCategoryDTO;
import com.example.starter_project_2025.system.assessment.dto.category.QuestionCategoryFilter;
import com.example.starter_project_2025.system.assessment.dto.question_tag.response.TagCountResponse;
import com.example.starter_project_2025.system.assessment.entity.QuestionCategory;
import com.example.starter_project_2025.system.assessment.repository.QuestionCategoryRepository;
import com.example.starter_project_2025.system.assessment.service.category.QuestionCategoryService;
import com.example.starter_project_2025.system.assessment.service.category.QuestionCategoryServiceImpl;
import com.example.starter_project_2025.system.assessment.service.question_tag.QuestionTagService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/question-categories")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Question Category Management", description = "APIs for managing question categories")
public class QuestionCategoryController
        extends BaseCrudDataIoController<QuestionCategory, UUID, QuestionCategoryDTO, QuestionCategoryFilter> {

    QuestionCategoryService questionCategoryService;
    QuestionCategoryRepository questionCategoryRepository;
    QuestionTagService questionTagService;

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


    @GetMapping("/{categoryId}/tags")
    public ResponseEntity<List<TagCountResponse>> getTagsByCategory(
            @PathVariable UUID categoryId
    ) {
        return ResponseEntity.ok(questionTagService.getTagsByCategory(categoryId));
    }
}