<<<<<<<< HEAD:backend/src/main/java/com/example/starter_project_2025/system/assessment/assessment_type/AssessmentTypeRepository.java
package com.example.starter_project_2025.system.assessment.assessment_type;

import com.example.starter_project_2025.base.repository.BaseCrudRepository;
========
package com.example.starter_project_2025.system.assessment_mgt.assessment_type;

import com.example.starter_project_2025.base.crud.BaseCrudRepository;
>>>>>>>> 969201241eddad103d8fabc8223f98735ac13075:backend/src/main/java/com/example/starter_project_2025/system/assessment_mgt/assessment_type/AssessmentTypeRepository.java
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssessmentTypeRepository extends BaseCrudRepository<AssessmentType, UUID> {

    boolean existsByName(String name);

    Optional<AssessmentType> findByName(String name);
}
