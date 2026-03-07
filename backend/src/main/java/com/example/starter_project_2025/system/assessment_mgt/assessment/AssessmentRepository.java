package com.example.starter_project_2025.system.assessment_mgt.assessment;

import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssessmentRepository extends BaseCrudRepository<Assessment, UUID> {

    boolean existsByCode(String code);

    Optional<Assessment> findByCode(String code);

    /**
     * Fetch assessment + assessmentQuestions (Set) + question + options (Set) in ONE query.
     * Safe now because both assessmentQuestions and options are Set (not List/bag).
     */
    @Query("SELECT DISTINCT a FROM Assessment a " +
           "LEFT JOIN FETCH a.assessmentQuestions aq " +
           "LEFT JOIN FETCH aq.question q " +
           "LEFT JOIN FETCH aq.options " +
           "WHERE a.id = :id")
    Optional<Assessment> findByIdWithQuestions(@Param("id") UUID id);

    /**
     * Kept for backward compatibility (identical to findByIdWithQuestions).
     */
    @Query("SELECT DISTINCT a FROM Assessment a " +
           "LEFT JOIN FETCH a.assessmentQuestions aq " +
           "LEFT JOIN FETCH aq.options " +
           "WHERE a.id = :id")
    Optional<Assessment> findByIdWithQuestionOptions(@Param("id") UUID id);
}


