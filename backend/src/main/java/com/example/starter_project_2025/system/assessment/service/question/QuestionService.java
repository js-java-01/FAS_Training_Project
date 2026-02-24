package com.example.starter_project_2025.system.assessment.service.question;

import com.example.starter_project_2025.system.assessment.dto.question.QuestionRequestDTO;
import com.example.starter_project_2025.system.assessment.dto.question.UpdateQuestionRequestDTO;
import com.example.starter_project_2025.system.assessment.entity.Question;
import com.example.starter_project_2025.system.assessment.entity.QuestionCategory;
import com.example.starter_project_2025.system.assessment.entity.QuestionOption;
import com.example.starter_project_2025.system.assessment.repository.QuestionCategoryRepository;
import com.example.starter_project_2025.system.assessment.repository.QuestionRepository;
import com.example.starter_project_2025.system.assessment.spec.QuestionSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepo;

    @Autowired
    private QuestionCategoryRepository categoryRepo;

    public Question createQuestion(QuestionRequestDTO dto) {
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

        return questionRepo.save(question);
    }

    // ===== CRUD BỔ SUNG =====

    public List<Question> getAll() {
        return questionRepo.findAll();
    }

    public void deleteById(UUID id) {
        questionRepo.deleteById(id);
    }

    public Question updateQuestion(UUID id, UpdateQuestionRequestDTO dto) {
        Question question = questionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        question.setContent(dto.getContent());
        question.setQuestionType(dto.getQuestionType());
        question.setIsActive(dto.getIsActive());

        QuestionCategory category = categoryRepo
                .findById(dto.getQuestionCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        question.setCategory(category);

        question.getOptions().clear();

        if (dto.getOptions() != null) {
            dto.getOptions().forEach(o -> {
                QuestionOption opt = new QuestionOption();
                opt.setContent(o.getContent());
                opt.setCorrect(o.isCorrect());
                opt.setOrderIndex(o.getOrderIndex());
                opt.setQuestion(question);
                question.getOptions().add(opt);
            });
        }

        return questionRepo.save(question);
    }

    public Question getQuestionById(UUID id) {
        return questionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));
    }

    public Page<Question> search(
            String keyword,
            UUID categoryId,
            String questionType,
            Pageable pageable
    ) {
        Specification<Question> spec =
                QuestionSpecification.filter(keyword, categoryId, questionType);


        return questionRepo.findAll(spec, pageable);
    }

}
