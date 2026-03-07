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

    @Query("SELECT aq FROM AssessmentQuestion aq " +
           "LEFT JOIN FETCH aq.options " +
           "WHERE aq.assessment.id = :assessmentId AND aq.question.id = :questionId")
    Optional<AssessmentQuestion> findByAssessmentIdAndQuestionId(
            @Param("assessmentId") UUID assessmentId,
            @Param("questionId") UUID questionId);

    /**
     * Load all AssessmentQuestions for an assessment WITH question + options eagerly.
     * Used by startSubmission to build snapshot — avoids Hibernate 1st-level cache issue
     * that occurs when fetching through Assessment.assessmentQuestions.
     */
    @Query("SELECT DISTINCT aq FROM AssessmentQuestion aq " +
           "LEFT JOIN FETCH aq.question q " +
           "LEFT JOIN FETCH aq.options " +
           "WHERE aq.assessment.id = :assessmentId")
    List<AssessmentQuestion> findByAssessmentIdWithQuestionAndOptions(
            @Param("assessmentId") UUID assessmentId);
}

