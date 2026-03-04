<<<<<<<< HEAD:backend/src/main/java/com/example/starter_project_2025/system/assessment/question_category/QuestionCategoryFilter.java
package com.example.starter_project_2025.system.assessment.question_category;
========
package com.example.starter_project_2025.system.assessment_mgt.question_category;
>>>>>>>> 969201241eddad103d8fabc8223f98735ac13075:backend/src/main/java/com/example/starter_project_2025/system/assessment_mgt/question_category/QuestionCategoryFilter.java

import com.example.starter_project_2025.base.crud.dto.FilterOperator;
import com.example.starter_project_2025.base.spec.FilterField;
import lombok.Builder;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Builder
public record QuestionCategoryFilter(

        @FilterField(entityField = "id")
        UUID id,

        @FilterField(entityField = "name", operator = FilterOperator.LIKE)
        String name,

        @FilterField(entityField = "description", operator = FilterOperator.LIKE)
        String description,

        @FilterField(entityField = "createdAt", operator = FilterOperator.BETWEEN)
        List<LocalDate> createdRange

) {}