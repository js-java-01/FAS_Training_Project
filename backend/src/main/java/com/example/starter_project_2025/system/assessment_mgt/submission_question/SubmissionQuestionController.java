package com.example.starter_project_2025.system.assessment_mgt.submission_question;

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
@RequestMapping("/api/submisson-questions")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Submisson-question management", description = "APIs for managing submisson-question")
public class SubmissionQuestionController extends BaseCrudDataIoController<SubmissionQuestion, UUID, SubmissionQuestionDTO, SubmissionQuestionFilter> {

    SubmissionQuestionRepository submissionQuestionRepository;
    SubmissionQuestionService submissonQuestionService;

    @Override
    protected BaseCrudRepository<SubmissionQuestion, UUID> getRepository() {
        return submissionQuestionRepository;
    }

    @Override
    protected Class<SubmissionQuestion> getEntityClass() {
        return SubmissionQuestion.class;
    }

    @Override
    protected CrudService<UUID, SubmissionQuestionDTO, SubmissionQuestionFilter> getService() {
        return submissonQuestionService;
    }
}
