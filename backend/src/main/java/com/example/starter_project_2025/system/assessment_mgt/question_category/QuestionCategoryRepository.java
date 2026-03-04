package com.example.starter_project_2025.system.assessment_mgt.question_category;

import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuestionCategoryRepository extends BaseCrudRepository<QuestionCategory, UUID> {

    Optional<QuestionCategory> findByName(String name);

    Boolean existsByNameIgnoreCase(String name);
}