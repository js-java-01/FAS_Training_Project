package com.example.starter_project_2025.system.assessment.service.category;

import com.example.starter_project_2025.system.assessment.dto.category.QuestionCategoryResponse;
import com.example.starter_project_2025.system.assessment.entity.QuestionCategory;
import com.example.starter_project_2025.system.assessment.repository.QuestionCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuestionCategoryService {

    private final QuestionCategoryRepository repository;

    public List<QuestionCategory> getAll() {
        return repository.findAll();
    }

    public QuestionCategory create(QuestionCategoryResponse dto) {
        QuestionCategory entity = new QuestionCategory();
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        return repository.save(entity);
    }

    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    public QuestionCategory getById(UUID id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("QuestionCategory not found"));
    }
}