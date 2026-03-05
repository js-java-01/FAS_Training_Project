package com.example.starter_project_2025.system.assessment_mgt.submission;


import com.example.starter_project_2025.base.crud.BaseCrudDataIoController;
import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import com.example.starter_project_2025.base.crud.CrudService;
import com.example.starter_project_2025.system.assessment_mgt.question_tag.QuestionTag;
import com.example.starter_project_2025.system.assessment_mgt.question_tag.QuestionTagDTO;
import com.example.starter_project_2025.system.assessment_mgt.question_tag.QuestionTagFilter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/submisson")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Submisson management", description = "APIs for managing submisson")
public class SubmissonController extends BaseCrudDataIoController<Submission, UUID, SubmissonDTO, SubmissonFilter> {

    SubmissonService submissonService;
    SubmissionRepository submissionRepository;

    @Override
    protected BaseCrudRepository<Submission, UUID> getRepository() {
        return submissionRepository;
    }

    @Override
    protected Class<Submission> getEntityClass() {
        return Submission.class;
    }

    @Override
    protected CrudService<UUID, SubmissonDTO, SubmissonFilter> getService() {
        return submissonService;
    }

    @PostMapping("/start")
    public Submission startSubmission(
            @RequestParam UUID userId,
            @RequestParam UUID assessmentId
    ) {
        return ((SubmissonServiceImpl) submissonService)
                .startSubmission(userId, assessmentId);
    }


    @PostMapping("/{submissionId}/answer")
    public Submission submitAnswer(
            @PathVariable UUID submissionId,
            @RequestParam UUID submissionQuestionId,
            @RequestParam String answerValue
    ) {
        return ((SubmissonServiceImpl) submissonService)
                .submitAnswer(submissionId, submissionQuestionId, answerValue);
    }


    @PostMapping("/{submissionId}/submit")
    public Submission submitSubmission(
            @PathVariable UUID submissionId
    ) {
        return ((SubmissonServiceImpl) submissonService)
                .submitSubmission(submissionId);
    }
}
