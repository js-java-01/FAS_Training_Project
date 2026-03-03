package com.example.starter_project_2025.system.assessment.repository;

import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import com.example.starter_project_2025.system.assessment.entity.QuestionCategory;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuestionCategoryRepository extends BaseCrudRepository<QuestionCategory, UUID> {

    Optional<QuestionCategory> findByName(String name);

    Boolean existsByNameIgnoreCase(String name);
}