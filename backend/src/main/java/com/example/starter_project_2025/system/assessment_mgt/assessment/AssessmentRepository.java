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
     * Fetch assessment cùng assessmentQuestions + question + options trong 1 query.
     * Tránh LazyInitializationException khi build SubmissionQuestion snapshot.
     */
    @Query("SELECT DISTINCT a FROM Assessment a " +
           "LEFT JOIN FETCH a.assessmentQuestions aq " +
           "LEFT JOIN FETCH aq.question q " +
           "WHERE a.id = :id")
    Optional<Assessment> findByIdWithQuestions(@Param("id") UUID id);
}


