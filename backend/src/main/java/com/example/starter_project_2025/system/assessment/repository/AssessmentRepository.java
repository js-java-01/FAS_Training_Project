package com.example.starter_project_2025.system.assessment.repository;

import com.example.starter_project_2025.system.assessment.entity.Assessment;
import com.example.starter_project_2025.system.assessment.enums.AssessmentDifficulty;
import com.example.starter_project_2025.system.assessment.enums.AssessmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long>, JpaSpecificationExecutor<Assessment> {
    boolean existsByCode(String code);
    Optional<Assessment> findAssessmentByStatus(AssessmentStatus status);
    Page<Assessment> findByDifficulty(AssessmentDifficulty difficulty, Pageable pageable);}
