package com.example.starter_project_2025.system.assessment.repository;

import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface AssessmentTypeRepository extends JpaRepository<AssessmentType,String>, JpaSpecificationExecutor<AssessmentType> {
    boolean existsByName(String name);
    Page<AssessmentType> findByNameContainingIgnoreCase(String name, Pageable pageable);
    AssessmentType findAssessmentById(String id);
}
