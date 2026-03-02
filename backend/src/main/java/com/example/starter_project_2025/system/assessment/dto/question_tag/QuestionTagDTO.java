package com.example.starter_project_2025.system.assessment.dto.question_tag;

import com.example.starter_project_2025.base.dto.CrudDto;
import com.example.starter_project_2025.base.dto.group.OnCreate;
import com.example.starter_project_2025.base.dto.group.OnUpdate;
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
public class QuestionTagDTO implements CrudDto<Long> {

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
