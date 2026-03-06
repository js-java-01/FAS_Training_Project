<<<<<<<< HEAD:backend/src/main/java/com/example/starter_project_2025/system/assessment/assessment_question/AssessmentQuestionDTO.java
package com.example.starter_project_2025.system.assessment.assessment_question;

========
package com.example.starter_project_2025.system.assessment_mgt.assessment_question;

import com.example.starter_project_2025.base.crud.dto.CrudDto;
>>>>>>>> 969201241eddad103d8fabc8223f98735ac13075:backend/src/main/java/com/example/starter_project_2025/system/assessment_mgt/assessment_question/AssessmentQuestionDTO.java
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AssessmentQuestionDTO {

    UUID id;

    UUID assessmentId;

    UUID questionId;

    Double score;

    Integer orderIndex;

}
