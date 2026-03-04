package com.example.starter_project_2025.system.assessment_mgt.question_option;


import com.example.starter_project_2025.base.crud.dto.CrudDto;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuestionOptionDTO implements CrudDto<UUID> {

        UUID id;

        String content;

        Boolean correct;

        Integer orderIndex;

        UUID questionId;

}
