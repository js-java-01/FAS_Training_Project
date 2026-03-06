<<<<<<<< HEAD:backend/src/main/java/com/example/starter_project_2025/system/assessment/assessment_type/AssessmentTypeFilter.java
package com.example.starter_project_2025.system.assessment.assessment_type;
========
package com.example.starter_project_2025.system.assessment_mgt.assessment_type;
>>>>>>>> 969201241eddad103d8fabc8223f98735ac13075:backend/src/main/java/com/example/starter_project_2025/system/assessment_mgt/assessment_type/AssessmentTypeFilter.java

import com.example.starter_project_2025.base.crud.dto.FilterOperator;
import com.example.starter_project_2025.base.spec.FilterField;
import lombok.Builder;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Builder
public record AssessmentTypeFilter(

        @FilterField(entityField = "id")
        UUID id,

        @FilterField(entityField = "name", operator = FilterOperator.LIKE)
        String name,

        @FilterField(entityField = "createdAt", operator = FilterOperator.BETWEEN)
        List<LocalDate> createdRange,

        @FilterField(entityField = "updatedAt", operator = FilterOperator.BETWEEN)
        List<LocalDate> updatedRange
) {
}