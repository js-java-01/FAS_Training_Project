package com.example.starter_project_2025.system.assessment_mgt.submission;

import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubmissionRepository
        extends BaseCrudRepository<Submission, UUID> {

    @Query("SELECT s FROM Submission s " +
           "LEFT JOIN FETCH s.submissionQuestions " +
           "WHERE s.id = :id")
    Optional<Submission> findByIdWithQuestions(@Param("id") UUID id);

    @Query("SELECT DISTINCT s FROM Submission s " +
           "LEFT JOIN FETCH s.submissionQuestions " +
           "WHERE s.id = :id")
    Optional<Submission> findByIdWithQuestionsAndAnswers(@Param("id") UUID id);

    @Query("SELECT COUNT(s) FROM Submission s " +
           "WHERE s.user.id = :userId AND s.assessment.id = :assessmentId")
    int countByUserIdAndAssessmentId(@Param("userId") UUID userId,
                                     @Param("assessmentId") UUID assessmentId);

    @Query("SELECT s FROM Submission s " +
           "LEFT JOIN FETCH s.submissionQuestions " +
           "WHERE s.user.id = :userId " +
           "  AND s.assessment.id = :assessmentId " +
           "  AND s.status = 'IN_PROGRESS'")
    Optional<Submission> findInProgressByUserAndAssessment(@Param("userId") UUID userId,
                                                           @Param("assessmentId") UUID assessmentId);

    List<Submission> findByUserId(UUID userId);

    List<Submission> findByAssessmentId(UUID assessmentId);
}
