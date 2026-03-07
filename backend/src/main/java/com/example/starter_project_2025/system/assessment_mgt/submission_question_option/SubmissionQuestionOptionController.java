package com.example.starter_project_2025.system.assessment_mgt.submission_question_option;

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
@RequestMapping("/api/submission-question-options")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Submission Question Option Management", description = "APIs for managing submission question options")
public class SubmissionQuestionOptionController
        extends
        BaseCrudDataIoController<SubmissionQuestionOption, UUID, SubmissionQuestionOptionDTO, SubmissionQuestionOptionFilter> {

    SubmissionQuestionOptionService submissionQuestionOptionService;
    SubmissionQuestionOptionRepository submissionQuestionOptionRepository;

    @Override
    protected BaseCrudRepository<SubmissionQuestionOption, UUID> getRepository() {
        return submissionQuestionOptionRepository;
    }

    @Override
    protected Class<SubmissionQuestionOption> getEntityClass() {
        return SubmissionQuestionOption.class;
    }

    @Override
    protected CrudService<UUID, SubmissionQuestionOptionDTO, SubmissionQuestionOptionFilter> getService() {
        return submissionQuestionOptionService;
    }
}
