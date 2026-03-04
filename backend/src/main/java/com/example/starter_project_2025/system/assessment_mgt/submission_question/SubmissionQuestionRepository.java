package com.example.starter_project_2025.system.assessment_mgt.submission_question;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionQuestionRepository
                extends JpaRepository<SubmissionQuestion, UUID> {
}
