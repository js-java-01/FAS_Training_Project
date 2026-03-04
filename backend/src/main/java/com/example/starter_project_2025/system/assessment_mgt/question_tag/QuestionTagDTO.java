<<<<<<<< HEAD:backend/src/main/java/com/example/starter_project_2025/system/assessment/question_tag/QuestionTagDTO.java
package com.example.starter_project_2025.system.assessment.question_tag;

import com.example.starter_project_2025.base.dto.OnCreate;
import com.example.starter_project_2025.base.dto.OnUpdate;
========
package com.example.starter_project_2025.system.assessment_mgt.question_tag;

import com.example.starter_project_2025.base.crud.dto.CrudDto;
import com.example.starter_project_2025.base.crud.dto.OnCreate;
import com.example.starter_project_2025.base.crud.dto.OnUpdate;
>>>>>>>> 969201241eddad103d8fabc8223f98735ac13075:backend/src/main/java/com/example/starter_project_2025/system/assessment_mgt/question_tag/QuestionTagDTO.java
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Null;
import lombok.*;
import lombok.experimental.FieldDefaults;

import static com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuestionTagDTO {

    @Null(groups = OnCreate.class)
    @NotNull(groups = OnUpdate.class)
    Long id;

    @NotBlank(groups = OnCreate.class, message = "Tag name is required")
    @NotBlank(groups = OnUpdate.class, message = "Tag name cannot be blank")
    String name;

    String description;

    @JsonProperty(access = READ_ONLY)
    Boolean active;

    @JsonProperty(access = READ_ONLY)
    java.time.LocalDateTime createdAt;

    @JsonProperty(access = READ_ONLY)
    java.time.LocalDateTime updatedAt;

}
