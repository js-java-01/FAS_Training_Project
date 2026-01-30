package com.example.starter_project_2025.system.assessment.repository;

import com.example.starter_project_2025.system.assessment.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface AssessmentRepository extends JpaRepository<Assessment,String> {
    boolean existsByName(String name);
    List<Assessment> findByNameContainingIgnoreCase(String name);
    Assessment findAssessmentById(String id);
}
