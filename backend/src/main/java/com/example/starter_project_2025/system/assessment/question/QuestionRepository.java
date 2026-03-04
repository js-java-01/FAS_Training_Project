package com.example.starter_project_2025.system.assessment.question;

import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface QuestionRepository extends BaseCrudRepository<Question, UUID> {
}