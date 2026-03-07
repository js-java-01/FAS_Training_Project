package com.example.starter_project_2025.system.course_online.feedback;

import com.example.starter_project_2025.base.crud.dto.CrudDto;
import com.example.starter_project_2025.base.crud.dto.OnCreate;
import com.example.starter_project_2025.base.crud.dto.OnUpdate;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseOnlineFeedbackDTO implements CrudDto<UUID> {

    @Null(groups = OnCreate.class)
    UUID id;

    @NotNull(groups = OnCreate.class, message = "Course Online ID is required")
    UUID courseOnlineId;

    UUID studentId;
    String studentName; // Trả về UI cho đẹp

    @NotNull(groups = OnCreate.class, message = "Rating is required")
    @Min(value = 1) @Max(value = 5)
    Integer rating;

    @Size(max = 1000)
    String comment;

    FeedbackStatus status;
}