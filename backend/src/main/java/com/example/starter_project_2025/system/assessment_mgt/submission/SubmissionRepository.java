package com.example.starter_project_2025.system.assessment_mgt.submission;

import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubmissionRepository
        extends BaseCrudRepository<Submission, UUID> {
    

    
    @Query("SELECT s FROM Submission s " +
           "LEFT JOIN FETCH s.submissionQuestions " +
           "WHERE s.id = :id")
    Optional<Submission> findByIdWithQuestions(@Param("id") UUID id);
}
