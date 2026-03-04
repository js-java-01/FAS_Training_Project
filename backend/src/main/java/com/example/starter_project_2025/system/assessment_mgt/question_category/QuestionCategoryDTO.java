<<<<<<<< HEAD:backend/src/main/java/com/example/starter_project_2025/system/assessment/question_category/QuestionCategoryDTO.java
package com.example.starter_project_2025.system.assessment.question_category;

========
package com.example.starter_project_2025.system.assessment_mgt.question_category;

import com.example.starter_project_2025.base.crud.dto.CrudDto;
>>>>>>>> 969201241eddad103d8fabc8223f98735ac13075:backend/src/main/java/com/example/starter_project_2025/system/assessment_mgt/question_category/QuestionCategoryDTO.java
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuestionCategoryDTO {

    UUID id;

    String name;

    String description;

    LocalDate createdAt;

    LocalDate updatedAt;
}