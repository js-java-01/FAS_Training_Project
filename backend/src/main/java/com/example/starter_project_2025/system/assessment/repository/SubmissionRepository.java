package com.example.starter_project_2025.system.assessment.repository;

import com.example.starter_project_2025.system.assessment.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface SubmissionRepository
        extends JpaRepository<Submission, UUID>,
        JpaSpecificationExecutor<Submission> {
    
    long countByUserIdAndAssessmentId(UUID userId, Long assessmentId);
    
    @Query("SELECT s FROM Submission s " +
           "LEFT JOIN FETCH s.submissionQuestions " +
           "WHERE s.id = :id")
    Optional<Submission> findByIdWithQuestions(@Param("id") UUID id);
}
