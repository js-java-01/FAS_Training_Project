package com.example.starter_project_2025.system.assessment_mgt.submission_question_option;

import com.example.starter_project_2025.base.crud.BaseCrudMapper;
import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import com.example.starter_project_2025.base.crud.CrudServiceImpl;
import com.example.starter_project_2025.system.assessment_mgt.submission_question.SubmissionQuestion;
import com.example.starter_project_2025.system.assessment_mgt.submission_question.SubmissionQuestionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SubmissionQuestionOptionServiceImpl
        extends
        CrudServiceImpl<SubmissionQuestionOption, UUID, SubmissionQuestionOptionDTO, SubmissionQuestionOptionFilter>
        implements SubmissionQuestionOptionService {

    SubmissionQuestionOptionRepository submissionQuestionOptionRepository;
    SubmissionQuestionOptionMapper submissionQuestionOptionMapper;
    SubmissionQuestionRepository submissionQuestionRepository;

    @Override
    protected BaseCrudRepository<SubmissionQuestionOption, UUID> getRepository() {
        return submissionQuestionOptionRepository;
    }

    @Override
    protected BaseCrudMapper<SubmissionQuestionOption, SubmissionQuestionOptionDTO> getMapper() {
        return submissionQuestionOptionMapper;
    }

    @Override
    protected String[] searchableFields() {
        return new String[] { "content" };
    }

    @Override
    public Page<SubmissionQuestionOptionDTO> getAll(Pageable pageable, String search,
            SubmissionQuestionOptionFilter filter) {
        return super.getAllEntity(pageable, search, filter);
    }

    @Override
    public SubmissionQuestionOptionDTO getById(UUID id) {
        return super.getByIdEntity(id);
    }

    @Override
    public SubmissionQuestionOptionDTO create(SubmissionQuestionOptionDTO request) {
        return super.createEntity(request);
    }

    @Override
    public SubmissionQuestionOptionDTO update(UUID id, SubmissionQuestionOptionDTO request) {
        return super.updateEntity(id, request);
    }

    @Override
    public void delete(UUID id) {
        super.deleteEntity(id);
    }

    @Override
    protected void beforeCreate(SubmissionQuestionOption entity, SubmissionQuestionOptionDTO request) {

        if (request.getSubmissionQuestionId() == null) {
            throw new RuntimeException("SubmissionQuestionId is required");
        }

        SubmissionQuestion submissionQuestion = submissionQuestionRepository.findById(request.getSubmissionQuestionId())
                .orElseThrow(() -> new RuntimeException("SubmissionQuestion not found"));

        entity.setSubmissionQuestion(submissionQuestion);
    }

    @Override
    protected void beforeUpdate(SubmissionQuestionOption entity, SubmissionQuestionOptionDTO request) {

        if (request.getContent() != null) {
            entity.setContent(request.getContent());
        }

        if (request.getCorrect() != null) {
            entity.setCorrect(request.getCorrect());
        }

        if (request.getOrderIndex() != null) {
            entity.setOrderIndex(request.getOrderIndex());
        }
    }
}
