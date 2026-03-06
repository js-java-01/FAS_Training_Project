package com.example.starter_project_2025.system.assessment.assessment;

import com.example.starter_project_2025.base.repository.BaseCrudRepository;

import java.util.UUID;

public interface AssessmentRepository extends BaseCrudRepository<Assessment, UUID> {

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, UUID id);
}
