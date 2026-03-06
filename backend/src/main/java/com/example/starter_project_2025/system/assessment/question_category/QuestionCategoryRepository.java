<<<<<<<< HEAD:backend/src/main/java/com/example/starter_project_2025/system/assessment/question_category/QuestionCategoryRepository.java
package com.example.starter_project_2025.system.assessment.question_category;

import com.example.starter_project_2025.base.repository.BaseCrudRepository;
========
package com.example.starter_project_2025.system.assessment_mgt.question_category;

import com.example.starter_project_2025.base.crud.BaseCrudRepository;
>>>>>>>> 969201241eddad103d8fabc8223f98735ac13075:backend/src/main/java/com/example/starter_project_2025/system/assessment_mgt/question_category/QuestionCategoryRepository.java
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuestionCategoryRepository extends BaseCrudRepository<QuestionCategory, UUID> {

    Optional<QuestionCategory> findByName(String name);

    Boolean existsByNameIgnoreCase(String name);
}