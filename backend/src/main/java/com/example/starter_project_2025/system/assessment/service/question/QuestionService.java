package com.example.starter_project_2025.system.assessment.service.question;

import com.example.starter_project_2025.system.assessment.dto.question.request.QuestionRequestDTO;
import com.example.starter_project_2025.system.assessment.dto.question.request.UpdateQuestionRequestDTO;
import com.example.starter_project_2025.system.assessment.dto.question.response.QuestionResponseDTO;
import com.example.starter_project_2025.system.assessment.entity.Question;
import com.example.starter_project_2025.system.assessment.entity.QuestionCategory;
import com.example.starter_project_2025.system.assessment.entity.QuestionOption;
import com.example.starter_project_2025.system.assessment.entity.Tag;
import com.example.starter_project_2025.system.assessment.mapper.QuestionMapper;
import com.example.starter_project_2025.system.assessment.repository.QuestionCategoryRepository;
import com.example.starter_project_2025.system.assessment.repository.QuestionRepository;
import com.example.starter_project_2025.system.assessment.repository.TagRepository;
import com.example.starter_project_2025.system.assessment.spec.QuestionSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepo;
    private final QuestionCategoryRepository categoryRepo;
    private final TagRepository tagRepo;
    private final QuestionMapper questionMapper;

    public QuestionResponseDTO createQuestion(QuestionRequestDTO dto) {
        Question question = new Question();
        question.setContent(dto.getContent());
        question.setQuestionType(dto.getQuestionType());

        // ===== SET CATEGORY =====
        if (dto.getQuestionCategoryId() != null) {
            QuestionCategory cat = categoryRepo
                    .findById(dto.getQuestionCategoryId())
                    .orElseThrow(() ->
                            new RuntimeException("Question category not found"));
            question.setCategory(cat);
        }

        // ===== SET OPTIONS =====
        if (dto.getOptions() != null && !dto.getOptions().isEmpty()) {
            List<QuestionOption> options = new ArrayList<>();

            dto.getOptions().forEach(optDto -> {
                QuestionOption opt = new QuestionOption();
                opt.setContent(optDto.getContent());
                opt.setCorrect(optDto.isCorrect());
                opt.setOrderIndex(optDto.getOrderIndex());
                opt.setQuestion(question);
                options.add(opt);
            });

            question.setOptions(options);
        }

        if (dto.getTagIds() != null && !dto.getTagIds().isEmpty()) {

            Set<Tag> tags = new HashSet<>(tagRepo.findAllById(dto.getTagIds()));

            if (tags.size() != dto.getTagIds().size()) {
                throw new RuntimeException("Some tags not found");
            }

            question.setTags(tags);
        }

        return questionMapper.toResponse(questionRepo.save(question));
    }

    // ===== CRUD BỔ SUNG =====

    public List<Question> getAll() {
        return questionRepo.findAll();
    }

    public void deleteById(UUID id) {
        questionRepo.deleteById(id);
    }

    public QuestionResponseDTO updateQuestion(UUID id, UpdateQuestionRequestDTO dto) {

        Question question = questionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        // ===== UPDATE BASIC INFO (PARTIAL) =====
        if (dto.content() != null) {
            question.setContent(dto.content());
        }

        if (dto.questionType() != null) {
            question.setQuestionType(dto.questionType());
        }

        if (dto.isActive() != null) {
            question.setIsActive(dto.isActive());
        }

        // ===== UPDATE CATEGORY =====
        if (dto.questionCategoryId() != null) {
            QuestionCategory category = categoryRepo
                    .findById(dto.questionCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            question.setCategory(category);
        }

        // ===== UPDATE OPTIONS =====
        if (dto.options() != null) {

            // Clear old options
            question.getOptions().clear();

            List<QuestionOption> newOptions = new ArrayList<>();

            dto.options().forEach(o -> {
                QuestionOption opt = new QuestionOption();
                opt.setContent(o.content());
                opt.setCorrect(Boolean.TRUE.equals(o.correct()));
                opt.setOrderIndex(o.orderIndex());
                opt.setQuestion(question);
                newOptions.add(opt);
            });

            // Validate before adding
            validateOptions(
                    dto.questionType() != null ? dto.questionType() : question.getQuestionType(),
                    newOptions
            );

            question.getOptions().addAll(newOptions);
        }

        // ===== UPDATE TAGS =====
        if (dto.tagIds() != null) {

            Set<Tag> tags = new HashSet<>(tagRepo.findAllById(dto.tagIds()));

            if (tags.size() != dto.tagIds().size()) {
                throw new RuntimeException("Some tags not found");
            }

            question.getTags().clear();
            question.getTags().addAll(tags);
        }

        return questionMapper.toResponse(questionRepo.save(question));
    }

    public QuestionResponseDTO getQuestionById(UUID id) {
        Question question = questionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        return questionMapper.toResponse(question);
    }

    public Page<QuestionResponseDTO> search(
            String keyword,
            UUID categoryId,
            String questionType,
            List<Long> tagIds,
            Pageable pageable
    ) {

        Specification<Question> spec =
                QuestionSpecification.filter(keyword, categoryId, questionType, tagIds);

        return questionRepo.findAll(spec, pageable)
                .map(questionMapper::toResponse);
    }

    private void validateOptions(String questionType, List<QuestionOption> options) {

        if (options == null || options.isEmpty()) {
            throw new RuntimeException("Question must have options");
        }

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
