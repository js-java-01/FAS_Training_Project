package com.example.starter_project_2025.system.assessment_mgt.assessment;

import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import com.example.starter_project_2025.system.assessment_mgt.assessment_type.AssessmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssessmentRepository extends BaseCrudRepository<Assessment, UUID> {

    boolean existsByCode(String code);

    Optional<Assessment> findByCode(String code);

}
