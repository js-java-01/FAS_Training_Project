package com.example.starter_project_2025.system.assessment_mgt.submission_answer;

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
public class SubmissionAnswerServiceImpl extends CrudServiceImpl<SubmissionAnswer, UUID, SubmissionAnswerDTO, SubmissionAnswerFilter>
        implements SubmissionAnswerService {

    SubmissionAnswerRepository submissionAnswerRepository;
    SubmissionAnswerMapper submissionAnswerMapper;


    @Override
    protected BaseCrudRepository<SubmissionAnswer, UUID> getRepository() {
        return submissionAnswerRepository;
    }

    @Override
    protected BaseCrudMapper<SubmissionAnswer, SubmissionAnswerDTO> getMapper() {
        return submissionAnswerMapper;
    }

    @Override
    protected String[] searchableFields() {
        return new String[0];
    }

    @Override
    public Page<SubmissionAnswerDTO> getAll(Pageable pageable, String search, SubmissionAnswerFilter filter) {
        return super.getAllEntity(pageable, search, filter);
    }

    @Override
    public SubmissionAnswerDTO getById(UUID id) {
        return super.getByIdEntity(id);
    }

    @Override
    public SubmissionAnswerDTO create(SubmissionAnswerDTO request) {
        return super.createEntity(request);
    }

    @Override
    public SubmissionAnswerDTO update(UUID id, SubmissionAnswerDTO request) {
        return super.updateEntity(id, request);
    }

    @Override
    public void delete(UUID id) {
        super.deleteEntity(id);
    }
}
