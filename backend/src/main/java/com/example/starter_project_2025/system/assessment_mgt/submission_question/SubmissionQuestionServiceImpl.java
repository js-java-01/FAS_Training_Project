package com.example.starter_project_2025.system.assessment_mgt.submission_question;

import com.example.starter_project_2025.base.crud.BaseCrudMapper;
import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import com.example.starter_project_2025.base.crud.CrudServiceImpl;
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
public class SubmissionQuestionServiceImpl extends CrudServiceImpl<SubmissionQuestion, UUID, SubmissionQuestionDTO, SubmissionQuestionFilter>
        implements SubmissionQuestionService {

    SubmissionQuestionRepository submissionQuestionRepository;
    SubmissionQuestionMapper submissionQuestionMapper;

    @Override
    protected BaseCrudRepository<SubmissionQuestion, UUID> getRepository() {
        return submissionQuestionRepository;
    }

    @Override
    protected BaseCrudMapper<SubmissionQuestion, SubmissionQuestionDTO> getMapper() {
        return submissionQuestionMapper;
    }

    @Override
    protected String[] searchableFields() {
        return new String[0];
    }

    @Override
    public Page<SubmissionQuestionDTO> getAll(Pageable pageable, String search, SubmissionQuestionFilter filter) {
        return super.getAllEntity(pageable, search, filter);
    }

    @Override
    public SubmissionQuestionDTO getById(UUID id) {
        return super.getByIdEntity(id);
    }

    @Override
    public SubmissionQuestionDTO create(SubmissionQuestionDTO request) {
        return super.createEntity(request);
    }

    @Override
    public SubmissionQuestionDTO update(UUID id, SubmissionQuestionDTO request) {
        return super.updateEntity(id, request);
    }

    @Override
    public void delete(UUID id) {
        super.deleteEntity(id);
    }
}
