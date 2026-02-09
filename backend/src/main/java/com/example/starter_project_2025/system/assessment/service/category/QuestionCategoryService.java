package com.example.starter_project_2025.system.assessment.service.category;

import com.example.starter_project_2025.system.assessment.dto.category.QuestionCategoryDTO;
import com.example.starter_project_2025.system.assessment.entity.QuestionCategory;
import com.example.starter_project_2025.system.assessment.repository.QuestionCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class QuestionCategoryService {

    @Autowired
    private QuestionCategoryRepository repository;

    public List<QuestionCategory> getAll() {
        return repository.findAll();
    }

    public QuestionCategory create(QuestionCategoryDTO dto) {
        QuestionCategory entity = new QuestionCategory();
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        return repository.save(entity);
    }
}