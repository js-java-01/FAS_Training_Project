package com.example.starter_project_2025.system.assessment_mgt.assessment_question_option;

import com.example.starter_project_2025.base.crud.BaseCrudMapper;
import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import com.example.starter_project_2025.base.crud.CrudServiceImpl;
import com.example.starter_project_2025.system.assessment_mgt.assessment_question.AssessmentQuestion;
import com.example.starter_project_2025.system.assessment_mgt.assessment_question.AssessmentQuestionRepository;
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
public class AssessmentQuestionOptionServiceImpl
        extends
        CrudServiceImpl<AssessmentQuestionOption, UUID, AssessmentQuestionOptionDTO, AssessmentQuestionOptionFilter>
        implements AssessmentQuestionOptionService {

    AssessmentQuestionOptionRepository assessmentQuestionOptionRepository;
    AssessmentQuestionOptionMapper assessmentQuestionOptionMapper;
    AssessmentQuestionRepository assessmentQuestionRepository;

    @Override
    protected BaseCrudRepository<AssessmentQuestionOption, UUID> getRepository() {
        return assessmentQuestionOptionRepository;
    }

    @Override
    protected BaseCrudMapper<AssessmentQuestionOption, AssessmentQuestionOptionDTO> getMapper() {
        return assessmentQuestionOptionMapper;
    }

    @Override
    protected String[] searchableFields() {
        return new String[] { "content" };
    }

    @Override
    public Page<AssessmentQuestionOptionDTO> getAll(Pageable pageable, String search,
            AssessmentQuestionOptionFilter filter) {
        return super.getAllEntity(pageable, search, filter);
    }

    @Override
    public AssessmentQuestionOptionDTO getById(UUID id) {
        return super.getByIdEntity(id);
    }

    @Override
    public AssessmentQuestionOptionDTO create(AssessmentQuestionOptionDTO request) {
        return super.createEntity(request);
    }

    @Override
    public AssessmentQuestionOptionDTO update(UUID id, AssessmentQuestionOptionDTO request) {
        return super.updateEntity(id, request);
    }

    @Override
    public void delete(UUID id) {
        super.deleteEntity(id);
    }

    @Override
    protected void beforeCreate(AssessmentQuestionOption entity, AssessmentQuestionOptionDTO request) {

        if (request.getAssessmentQuestionId() == null) {
            throw new RuntimeException("AssessmentQuestionId is required");
        }

        AssessmentQuestion assessmentQuestion = assessmentQuestionRepository.findById(request.getAssessmentQuestionId())
                .orElseThrow(() -> new RuntimeException("AssessmentQuestion not found"));

        entity.setAssessmentQuestion(assessmentQuestion);
    }

    @Override
    protected void beforeUpdate(AssessmentQuestionOption entity, AssessmentQuestionOptionDTO request) {

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
