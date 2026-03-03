package com.example.starter_project_2025.system.course_online.mapper;


import com.example.starter_project_2025.system.course_online.dto.CourseObjectiveCreateRequest;
import com.example.starter_project_2025.system.course_online.dto.CourseObjectiveResponse;
import com.example.starter_project_2025.system.course_online.entity.CourseObjective;
import org.springframework.stereotype.Component;

@Component
public class CourseObjectiveMapper {
    public CourseObjective toEntity(
            CourseObjectiveCreateRequest req) {

        return CourseObjective.builder()
                .code(req.getCode())
                .name(req.getName())
                .description(req.getDescription())
                .build();
    }

    public CourseObjectiveResponse toResponse(
            CourseObjective entity) {

        return CourseObjectiveResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .description(entity.getDescription())
                .createdDate(entity.getCreatedDate())
                .build();
    }
}
