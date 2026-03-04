<<<<<<<< HEAD:backend/src/main/java/com/example/starter_project_2025/system/assessment/question_option/QuestionOptionRepository.java
package com.example.starter_project_2025.system.assessment.question_option;

import com.example.starter_project_2025.base.repository.BaseCrudRepository;
========
package com.example.starter_project_2025.system.assessment_mgt.question_option;

import com.example.starter_project_2025.base.crud.BaseCrudRepository;
>>>>>>>> 969201241eddad103d8fabc8223f98735ac13075:backend/src/main/java/com/example/starter_project_2025/system/assessment_mgt/question_option/QuestionOptionRepository.java
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuestionOptionRepository extends BaseCrudRepository<QuestionOption, UUID> {

    List<QuestionOption> findByQuestionId(UUID questionId);
}