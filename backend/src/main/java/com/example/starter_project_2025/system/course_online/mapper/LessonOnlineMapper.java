package com.example.starter_project_2025.system.course_online.mapper;

import org.springframework.stereotype.Component;

import com.example.starter_project_2025.system.course_online.dto.LessonCreateOnlineRequest;
import com.example.starter_project_2025.system.course_online.dto.LessonOnlineResponse;
import com.example.starter_project_2025.system.course_online.entity.CourseLessonOnline;

@Component
public class LessonOnlineMapper {
    public CourseLessonOnline toEntity(LessonCreateOnlineRequest request) {
        return CourseLessonOnline.builder()
                .lessonName(request.getLessonName())
                .description(request.getDescription())
                .build();
    }

    public LessonOnlineResponse toResponse(CourseLessonOnline entity, Integer computedDuration) {
        return LessonOnlineResponse.builder()
                .id(entity.getId())
                .lessonName(entity.getLessonName())
                .description(entity.getDescription())
                .courseId(entity.getCourse().getId())
                .duration(computedDuration)
                .build();
    }
}
