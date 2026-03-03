package com.example.starter_project_2025.system.course_online.mapper;

import com.example.starter_project_2025.system.course_online.dto.LessonCreateRequest;
import com.example.starter_project_2025.system.course_online.dto.LessonResponse;
import com.example.starter_project_2025.system.course_online.entity.CourseLesson;
import org.springframework.stereotype.Component;

@Component
public class LessonMapper {
    public CourseLesson toEntity(LessonCreateRequest request) {
        return CourseLesson.builder()
                .lessonName(request.getLessonName())
                .description(request.getDescription())
                .build();
    }

    public LessonResponse toResponse(CourseLesson entity, Integer computedDuration) {
        return LessonResponse.builder()
                .id(entity.getId())
                .lessonName(entity.getLessonName())
                .description(entity.getDescription())
                .courseId(entity.getCourse().getId())
                .duration(computedDuration)
                .build();
    }
}
