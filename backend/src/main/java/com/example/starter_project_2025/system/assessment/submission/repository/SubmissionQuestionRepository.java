package com.example.starter_project_2025.system.assessment.submission.repository;

import com.example.starter_project_2025.system.assessment.submission.entity.SubmissionQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionQuestionRepository
        extends JpaRepository<SubmissionQuestion, Long> {
}
