package com.example.starter_project_2025.system.assessment.service.assessmentquestion;

import com.example.starter_project_2025.base.mapper.BaseCrudMapper;
import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import com.example.starter_project_2025.base.service.CrudServiceImpl;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.assessment.dto.assessmentquestion.AssessmentQuestionDTO;
import com.example.starter_project_2025.system.assessment.dto.assessmentquestion.AssessmentQuestionFilter;
import com.example.starter_project_2025.system.assessment.entity.Assessment;
import com.example.starter_project_2025.system.assessment.entity.AssessmentQuestion;
import com.example.starter_project_2025.system.assessment.entity.Question;
import com.example.starter_project_2025.system.assessment.mapper.AssessmentQuestionMapper;
import com.example.starter_project_2025.system.assessment.repository.AssessmentQuestionRepository;
import com.example.starter_project_2025.system.assessment.repository.AssessmentRepository;
import com.example.starter_project_2025.system.assessment.repository.QuestionRepository;
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
public class AssessmentQuestionServiceImpl extends CrudServiceImpl<AssessmentQuestion, UUID, AssessmentQuestionDTO, AssessmentQuestionFilter>
        implements AssessmentQuestionService {

    AssessmentQuestionRepository assessmentQuestionRepository;
    AssessmentQuestionMapper assessmentQuestionMapper;
    AssessmentRepository assessmentRepository;
    QuestionRepository questionRepository;


    @Override
    protected BaseCrudRepository<AssessmentQuestion, UUID> getRepository() {
        return assessmentQuestionRepository;
    }

    @Override
    protected BaseCrudMapper<AssessmentQuestion, AssessmentQuestionDTO> getMapper() {
        return assessmentQuestionMapper;
    }

    @Override
    protected String[] searchableFields() {
        return new String[]{};
    }

    @Override
    public Page<AssessmentQuestionDTO> getAll(Pageable pageable, String search, AssessmentQuestionFilter filter) {
        return super.getAllEntity(pageable, search, filter);
    }

    @Override
    public AssessmentQuestionDTO getById(UUID id) {
        return super.getByIdEntity(id);
    }

    @Override
    public AssessmentQuestionDTO create(AssessmentQuestionDTO request) {
        return super.createEntity(request);
    }

    @Override
    public AssessmentQuestionDTO update(UUID id, AssessmentQuestionDTO request) {
        return super.updateEntity(id, request);
    }

    @Override
    public void delete(UUID id) {

    }

    @Override
    protected void beforeCreate(AssessmentQuestion entity,
                                AssessmentQuestionDTO request) {

        setAssessment(entity, request.getAssessmentId());
        setQuestion(entity, request.getQuestionId());
    }

    @Override
    protected void beforeUpdate(AssessmentQuestion entity,
                                AssessmentQuestionDTO request) {

        if (request.getAssessmentId() != null) {
            setAssessment(entity, request.getAssessmentId());
        }

        if (request.getQuestionId() != null) {
            setQuestion(entity, request.getQuestionId());
        }
    }

    private void setAssessment(AssessmentQuestion entity, Long id) {
        Assessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found"));
        entity.setAssessment(assessment);
    }

    private void setQuestion(AssessmentQuestion entity, UUID id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        entity.setQuestion(question);
    }
}
