package com.example.starter_project_2025.system.assessment.repository;

import com.example.starter_project_2025.system.assessment.entity.Assessment;
import com.example.starter_project_2025.system.assessment.enums.AssessmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long>, JpaSpecificationExecutor<Assessment> {
    Optional<Assessment> findByCode(String code);

    boolean existsByCode(String code);
    Optional<Assessment> findAssessmentByStatus(AssessmentStatus status);
    
    @Query("SELECT a FROM Assessment a " +
           "LEFT JOIN FETCH a.assessmentQuestions aq " +
           "LEFT JOIN FETCH aq.question " +
           "WHERE a.id = :id")
    Optional<Assessment> findByIdWithQuestions(@Param("id") Long id);
}
