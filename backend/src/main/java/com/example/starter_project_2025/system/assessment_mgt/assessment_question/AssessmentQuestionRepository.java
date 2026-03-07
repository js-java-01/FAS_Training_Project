package com.example.starter_project_2025.system.assessment_mgt.assessment_question;

import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssessmentQuestionRepository extends BaseCrudRepository<AssessmentQuestion, UUID> {
    List<AssessmentQuestion> findByAssessmentId(UUID assessmentId);

    @Query("SELECT aq FROM AssessmentQuestion aq LEFT JOIN FETCH aq.options WHERE aq.assessment.id = :assessmentId AND aq.question.id = :questionId")
    Optional<AssessmentQuestion> findByAssessmentIdAndQuestionId(@Param("assessmentId") UUID assessmentId, @Param("questionId") UUID questionId);
}