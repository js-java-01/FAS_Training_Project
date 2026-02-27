package com.example.starter_project_2025.system.assessment.service.question;


import com.example.starter_project_2025.system.assessment.dto.question.request.UpdateQuestionOptionDTO;
import com.example.starter_project_2025.system.assessment.entity.QuestionOption;
import com.example.starter_project_2025.system.assessment.repository.QuestionOptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuestionOptionService {

    private final QuestionOptionRepository optionRepo;

    public QuestionOption findById(UUID id) {
        return optionRepo.findById(id).orElseThrow(() -> new RuntimeException("QuestionOption not found"));
    }

    public QuestionOption update(UUID id, UpdateQuestionOptionDTO dto) {

        QuestionOption option = findById(id);

        option.setContent(dto.content());
        option.setCorrect(dto.correct());
        option.setOrderIndex(dto.orderIndex());

        return optionRepo.save(option);
    }


}
