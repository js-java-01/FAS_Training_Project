package com.example.starter_project_2025.system.assessment.assessment_type;

import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssessmentTypeRepository extends BaseCrudRepository<AssessmentType, UUID> {

    boolean existsByName(String name);

    Optional<AssessmentType> findByName(String name);
}
