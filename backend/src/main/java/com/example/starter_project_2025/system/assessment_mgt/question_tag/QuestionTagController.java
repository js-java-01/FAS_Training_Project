package com.example.starter_project_2025.system.assessment_mgt.question_tag;

import com.example.starter_project_2025.base.crud.BaseCrudDataIoController;
import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import com.example.starter_project_2025.base.crud.CrudService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/question-tags")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Question Tag Management", description = "APIs for managing question tags")
public class QuestionTagController
        extends BaseCrudDataIoController<QuestionTag, Long, QuestionTagDTO, QuestionTagFilter> {

    QuestionTagService questionTagService;
    QuestionTagRepository questionTagRepository;

    @Override
    protected BaseCrudRepository<QuestionTag, Long> getRepository() {
        return questionTagRepository;
    }

    @Override
    protected Class<QuestionTag> getEntityClass() {
        return QuestionTag.class;
    }

    @Override
    protected CrudService<Long, QuestionTagDTO, QuestionTagFilter> getService() {
        return questionTagService;
    }
}
