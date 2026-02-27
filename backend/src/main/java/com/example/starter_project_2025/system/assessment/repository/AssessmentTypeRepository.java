package com.example.starter_project_2025.system.assessment.repository;

import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AssessmentTypeRepository extends JpaRepository<AssessmentType,String>, JpaSpecificationExecutor<AssessmentType> {
    boolean existsByName(String name);
    Optional<AssessmentType> findByName(String name);
}
