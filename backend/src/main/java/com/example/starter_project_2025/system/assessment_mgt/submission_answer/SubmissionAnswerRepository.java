package com.example.starter_project_2025.system.assessment_mgt.submission_answer;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionAnswerRepository
                extends JpaRepository<SubmissionAnswer, UUID> {
}
