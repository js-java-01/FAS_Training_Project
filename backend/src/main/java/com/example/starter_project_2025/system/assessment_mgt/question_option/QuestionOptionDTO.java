<<<<<<<< HEAD:backend/src/main/java/com/example/starter_project_2025/system/assessment/question_option/QuestionOptionDTO.java
package com.example.starter_project_2025.system.assessment.question_option;


========
package com.example.starter_project_2025.system.assessment_mgt.question_option;


import com.example.starter_project_2025.base.crud.dto.CrudDto;
>>>>>>>> 969201241eddad103d8fabc8223f98735ac13075:backend/src/main/java/com/example/starter_project_2025/system/assessment_mgt/question_option/QuestionOptionDTO.java
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuestionOptionDTO {

        UUID id;

        String content;

        Boolean correct;

        Integer orderIndex;

        UUID questionId;

}
