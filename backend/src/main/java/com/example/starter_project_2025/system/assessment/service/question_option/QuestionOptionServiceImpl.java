package com.example.starter_project_2025.system.assessment.service.question_option;

import com.example.starter_project_2025.base.mapper.BaseCrudMapper;
import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import com.example.starter_project_2025.base.service.CrudServiceImpl;
import com.example.starter_project_2025.system.assessment.dto.question_option.QuestionOptionDTO;
import com.example.starter_project_2025.system.assessment.dto.question_option.QuestionOptionFilter;
import com.example.starter_project_2025.system.assessment.entity.Question;
import com.example.starter_project_2025.system.assessment.entity.QuestionOption;
import com.example.starter_project_2025.system.assessment.mapper.QuestionOptionMapper;
import com.example.starter_project_2025.system.assessment.repository.QuestionOptionRepository;
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
public class QuestionOptionServiceImpl
        extends CrudServiceImpl<QuestionOption, UUID, QuestionOptionDTO, QuestionOptionFilter>
        implements QuestionOptionService {

    QuestionOptionRepository questionOptionRepository;
    QuestionOptionMapper questionOptionMapper;
    QuestionRepository questionRepository;

    @Override
    protected BaseCrudRepository<QuestionOption, UUID> getRepository() {
        return questionOptionRepository;
    }

    @Override
    protected BaseCrudMapper<QuestionOption, QuestionOptionDTO> getMapper() {
        return questionOptionMapper;
    }

    @Override
    protected String[] searchableFields() {
        return new String[]{"content"};
    }

    @Override
    public Page<QuestionOptionDTO> getAll(Pageable pageable, String search, QuestionOptionFilter filter) {
        return super.getAllEntity(pageable, search, filter);
    }

    @Override
    public QuestionOptionDTO getById(UUID id) {
        return super.getByIdEntity(id);
    }

    @Override
    public QuestionOptionDTO create(QuestionOptionDTO request) {
        return super.createEntity(request);
    }

    @Override
    public QuestionOptionDTO update(UUID id, QuestionOptionDTO request) {
        return super.updateEntity(id, request);
    }

    @Override
    public void delete(UUID id) {
        super.deleteEntity(id);
    }

    @Override
    protected void beforeCreate(QuestionOption entity, QuestionOptionDTO request) {

        if (request.getQuestionId() == null) {
            throw new RuntimeException("QuestionId is required");
        }

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        entity.setQuestion(question);
    }

    @Override
    protected void beforeUpdate(QuestionOption entity, QuestionOptionDTO request) {

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
