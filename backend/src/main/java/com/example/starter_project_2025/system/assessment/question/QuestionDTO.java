<<<<<<<< HEAD:backend/src/main/java/com/example/starter_project_2025/system/assessment/question/QuestionDTO.java
package com.example.starter_project_2025.system.assessment.question;

import com.example.starter_project_2025.system.assessment.question_option.QuestionOptionDTO;
========
package com.example.starter_project_2025.system.assessment_mgt.question;

import com.example.starter_project_2025.base.crud.dto.CrudDto;
import com.example.starter_project_2025.system.assessment_mgt.question_option.QuestionOptionDTO;
>>>>>>>> 969201241eddad103d8fabc8223f98735ac13075:backend/src/main/java/com/example/starter_project_2025/system/assessment_mgt/question/QuestionDTO.java
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuestionDTO {

    UUID id;

    String content;

    String questionType;

    Boolean isActive;

    UUID categoryId;

    Set<Long> tagIds;

    List<QuestionOptionDTO> options;

    LocalDate createdAt;
    LocalDate updatedAt;
}