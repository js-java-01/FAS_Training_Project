package com.example.starter_project_2025.system.assessment_mgt.assessment_question_option;

import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssessmentQuestionOptionRepository extends BaseCrudRepository<AssessmentQuestionOption, UUID> {

    List<AssessmentQuestionOption> findByAssessmentQuestionId(UUID assessmentQuestionId);

    // Tìm options theo assessmentId + questionId (dùng khi cần fallback)
    @Query("SELECT o FROM AssessmentQuestionOption o " +
           "WHERE o.assessmentQuestion.assessment.id = :assessmentId " +
           "AND o.assessmentQuestion.question.id = :questionId")
    List<AssessmentQuestionOption> findByAssessmentIdAndQuestionId(
            @Param("assessmentId") UUID assessmentId,
            @Param("questionId") UUID questionId);
}