<<<<<<<< HEAD:backend/src/main/java/com/example/starter_project_2025/system/assessment/question_tag/QuestionTagFilter.java
package com.example.starter_project_2025.system.assessment.question_tag;
========
package com.example.starter_project_2025.system.assessment_mgt.question_tag;
>>>>>>>> 969201241eddad103d8fabc8223f98735ac13075:backend/src/main/java/com/example/starter_project_2025/system/assessment_mgt/question_tag/QuestionTagFilter.java

import com.example.starter_project_2025.base.crud.dto.FilterOperator;
import com.example.starter_project_2025.base.spec.FilterField;
import lombok.Builder;

import java.util.List;

@Builder
public record QuestionTagFilter(

        @FilterField(entityField = "id")
        Long id,

        @FilterField(entityField = "name", operator = FilterOperator.LIKE)
        String name,

        @FilterField(entityField = "description", operator = FilterOperator.LIKE)
        String description,

        @FilterField(entityField = "questions.id", operator = FilterOperator.IN)
        List<Long> questionIds

) {
}
