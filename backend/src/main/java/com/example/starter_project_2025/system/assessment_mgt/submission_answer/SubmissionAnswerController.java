package com.example.starter_project_2025.system.assessment_mgt.submission_answer;

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
@RequestMapping("/api/submission-answers")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Submisson answer", description = "APIs for managing submisson-answer")
public class SubmissionAnswerController extends BaseCrudDataIoController<SubmissionAnswer, UUID, SubmissionAnswerDTO, SubmissionAnswerFilter> {

    SubmissionAnswerRepository submissionAnswerRepository;
    SubmissionAnswerService submissonAnswerService;

    @Override
    protected BaseCrudRepository<SubmissionAnswer, UUID> getRepository() {
        return submissionAnswerRepository;
    }

    @Override
    protected Class<SubmissionAnswer> getEntityClass() {
        return SubmissionAnswer.class;
    }

    @Override
    protected CrudService<UUID, SubmissionAnswerDTO, SubmissionAnswerFilter> getService() {
        return submissonAnswerService;
    }
}
