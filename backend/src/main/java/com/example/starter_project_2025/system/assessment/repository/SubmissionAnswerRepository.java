package com.example.starter_project_2025.system.assessment.repository;

import com.example.starter_project_2025.system.assessment.entity.SubmissionAnswer;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionAnswerRepository
                extends JpaRepository<SubmissionAnswer, UUID> {
}
