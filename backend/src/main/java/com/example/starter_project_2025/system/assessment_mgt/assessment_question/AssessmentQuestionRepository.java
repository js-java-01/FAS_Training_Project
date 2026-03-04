package com.example.starter_project_2025.system.assessment_mgt.assessment_question;

import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AssessmentQuestionRepository extends BaseCrudRepository<AssessmentQuestion, UUID> {
}