package com.example.starter_project_2025.system.assessment.question_option;


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
