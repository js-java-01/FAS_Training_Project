package com.example.starter_project_2025.system.assessment.submission.repository;

import com.example.starter_project_2025.system.assessment.submission.entity.SubmissionAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionAnswerRepository
        extends JpaRepository<SubmissionAnswer, Long> {
}
