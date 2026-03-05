package com.example.starter_project_2025.system.course_online.feedback;

import com.example.starter_project_2025.base.spec.FilterField;
import lombok.Builder;

import java.util.UUID;

@Builder
public record CourseOnlineFeedbackFilter(
        @FilterField(entityField = "courseOnline.id")
        UUID courseOnlineId,

        @FilterField(entityField = "student.id")
        UUID studentId,

        @FilterField(entityField = "rating")
        Integer rating,

        @FilterField(entityField = "status")
        FeedbackStatus status
) {
}