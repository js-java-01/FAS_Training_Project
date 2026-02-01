package com.example.starter_project_2025.system.assessment.repository;

import com.example.starter_project_2025.system.assessment.entity.Assessment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface AssessmentRepository extends JpaRepository<Assessment,String>, JpaSpecificationExecutor<Assessment> {
    boolean existsByName(String name);
    Page<Assessment> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Assessment findAssessmentById(String id);
}
