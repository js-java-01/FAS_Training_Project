package com.example.starter_project_2025.system.assessment.service.question;

import com.example.starter_project_2025.system.assessment.dto.question.QuestionRequestDTO;
import com.example.starter_project_2025.system.assessment.entity.Question;
import com.example.starter_project_2025.system.assessment.entity.QuestionCategory;
import com.example.starter_project_2025.system.assessment.entity.QuestionOption;
import com.example.starter_project_2025.system.assessment.repository.QuestionCategoryRepository;
import com.example.starter_project_2025.system.assessment.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
}
