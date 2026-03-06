package com.example.starter_project_2025.system.assessment_mgt.assessment_question_option;

import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssessmentQuestionOptionRepository extends BaseCrudRepository<AssessmentQuestionOption, UUID> {

    List<AssessmentQuestionOption> findByAssessmentQuestionId(UUID questionId);
}