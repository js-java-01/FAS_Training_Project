<<<<<<<< HEAD:backend/src/main/java/com/example/starter_project_2025/system/assessment/question_tag/QuestionTagRepository.java
package com.example.starter_project_2025.system.assessment.question_tag;

import com.example.starter_project_2025.base.repository.BaseCrudRepository;
========
package com.example.starter_project_2025.system.assessment_mgt.question_tag;

import com.example.starter_project_2025.base.crud.BaseCrudRepository;
>>>>>>>> 969201241eddad103d8fabc8223f98735ac13075:backend/src/main/java/com/example/starter_project_2025/system/assessment_mgt/question_tag/QuestionTagRepository.java
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionTagRepository extends BaseCrudRepository<QuestionTag, Long> {

    boolean existsByNameIgnoreCase(String name);

//    @Query("""
//       SELECT new com.example.starter_project_2025.system.assessment.dto.question_tag.response.TagCountResponse(
//           t.id,
//           t.name,
//           COUNT(q.id)
//       )
//       FROM Question q
//       JOIN q.tags t
//       WHERE q.category.id = :categoryId
//       GROUP BY t.id, t.name
//       ORDER BY COUNT(q.id) DESC, t.name ASC
//       """)
//    List<TagCountResponse> findTagsByCategoryWithCount(UUID categoryId);


}

