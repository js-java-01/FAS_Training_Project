package com.example.starter_project_2025.system.course.mapper;

import com.example.starter_project_2025.system.course.dto.LessonCreateRequest;
import com.example.starter_project_2025.system.course.dto.LessonResponse;
import com.example.starter_project_2025.system.course.entity.CourseLesson;
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
