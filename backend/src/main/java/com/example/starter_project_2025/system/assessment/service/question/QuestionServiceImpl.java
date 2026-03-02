package com.example.starter_project_2025.system.assessment.service.question;

import com.example.starter_project_2025.base.mapper.BaseCrudMapper;
import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import com.example.starter_project_2025.base.service.CrudServiceImpl;
import com.example.starter_project_2025.system.assessment.dto.question.QuestionDTO;
import com.example.starter_project_2025.system.assessment.dto.question.QuestionFilter;
import com.example.starter_project_2025.system.assessment.dto.question_option.QuestionOptionDTO;
import com.example.starter_project_2025.system.assessment.entity.Question;
import com.example.starter_project_2025.system.assessment.entity.QuestionCategory;
import com.example.starter_project_2025.system.assessment.entity.QuestionOption;
import com.example.starter_project_2025.system.assessment.entity.QuestionTag;
import com.example.starter_project_2025.system.assessment.mapper.QuestionMapper;
import com.example.starter_project_2025.system.assessment.repository.QuestionCategoryRepository;
import com.example.starter_project_2025.system.assessment.repository.QuestionRepository;
import com.example.starter_project_2025.system.assessment.repository.QuestionTagRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;


@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuestionServiceImpl
        extends CrudServiceImpl<Question, UUID, QuestionDTO, QuestionFilter>
        implements QuestionService {

    QuestionRepository questionRepository;
    QuestionMapper questionMapper;
    QuestionCategoryRepository categoryRepo;
    QuestionTagRepository tagRepo;


    @Override
    protected BaseCrudRepository<Question, UUID> getRepository() {
        return questionRepository;
    }

    @Override
    protected BaseCrudMapper<Question, QuestionDTO> getMapper() {
        return questionMapper;
    }

    @Override
    protected String[] searchableFields() {
        return new String[]{"content"};
    }

    @Override
    public Page<QuestionDTO> getAll(Pageable pageable, String search, QuestionFilter filter) {
        return super.getAllEntity(pageable, search, filter);
    }

    @Override
    public QuestionDTO getById(UUID id) {
        return super.getByIdEntity(id);
    }

    @Override
    public QuestionDTO create(QuestionDTO request) {
        return super.createEntity(request);
    }

    @Override
    public QuestionDTO update(UUID id, QuestionDTO request) {
        return super.updateEntity(id, request);
    }

    @Override
    public void delete(UUID id) {
        super.deleteEntity(id);
    }

    @Override
    protected void beforeCreate(Question entity, QuestionDTO request) {
        if (request.getQuestionType() == null) {
            throw new RuntimeException("Question type is required");
        }

        setCategory(entity, request.getCategoryId());
        setTags(entity, request.getTagIds());
        setOptions(entity, request.getOptions(), request.getQuestionType());
    }


    @Override
    protected void beforeUpdate(Question entity, QuestionDTO request) {

        if (request.getCategoryId() != null) {
            setCategory(entity, request.getCategoryId());
        }

        if (request.getTagIds() != null) {
            entity.getTags().clear();
            setTags(entity, request.getTagIds());
        }

        if (request.getOptions() != null) {
            entity.getOptions().clear();

            String type = request.getQuestionType() != null
                    ? request.getQuestionType()
                    : entity.getQuestionType();

            setOptions(entity, request.getOptions(), type);
        }
    }


    private void setCategory(Question question, UUID categoryId) {

        QuestionCategory category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        question.setCategory(category);
    }

    private void setTags(Question question, Set<Long> tagIds) {

        if (tagIds == null || tagIds.isEmpty()) {
            return;
        }

        Set<QuestionTag> tags = new HashSet<>(tagRepo.findAllById(tagIds));

        if (tags.size() != tagIds.size()) {
            throw new RuntimeException("Some tags not found");
        }

        question.getTags().addAll(tags);
    }

    private void setOptions(Question question,
                            List<QuestionOptionDTO> options,
                            String questionType) {

        if (options == null || options.isEmpty()) {
            throw new RuntimeException("Question must have options");
        }

        List<QuestionOption> newOptions = new ArrayList<>();

        for (QuestionOptionDTO dto : options) {

            QuestionOption option = new QuestionOption();
            option.setContent(dto.getContent());
            option.setCorrect(Boolean.TRUE.equals(dto.getCorrect()));
            option.setOrderIndex(dto.getOrderIndex());
            option.setQuestion(question);

            newOptions.add(option);
        }

        validateOptions(questionType, newOptions);

        question.setOptions(newOptions);
    }

    private void validateOptions(String questionType,
                                 List<QuestionOption> options) {

        long correctCount = options.stream()
                .filter(QuestionOption::isCorrect)
                .count();

        if ("SINGLE".equalsIgnoreCase(questionType) && correctCount != 1) {
            throw new RuntimeException("SINGLE question must have exactly 1 correct answer");
        }

        if ("MULTIPLE".equalsIgnoreCase(questionType) && correctCount < 2) {
            throw new RuntimeException("MULTIPLE question must have at least 2 correct answers");
        }
    }
}
