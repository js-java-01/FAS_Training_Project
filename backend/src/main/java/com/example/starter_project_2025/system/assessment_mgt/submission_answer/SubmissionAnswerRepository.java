package com.example.starter_project_2025.system.assessment_mgt.submission_answer;

import java.util.UUID;

import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import com.example.starter_project_2025.system.assessment_mgt.submission.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubmissionAnswerRepository
        extends BaseCrudRepository<SubmissionAnswer, UUID> {
}
