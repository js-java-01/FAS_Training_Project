package com.example.starter_project_2025.system.assessment.question_option;

import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuestionOptionRepository extends BaseCrudRepository<QuestionOption, UUID> {

    List<QuestionOption> findByQuestionId(UUID questionId);
}