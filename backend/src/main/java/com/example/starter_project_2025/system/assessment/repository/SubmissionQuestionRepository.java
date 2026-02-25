package com.example.starter_project_2025.system.assessment.repository;

import com.example.starter_project_2025.system.assessment.entity.SubmissionQuestion;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionQuestionRepository
                extends JpaRepository<SubmissionQuestion, UUID> {
}
