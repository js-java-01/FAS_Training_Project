package com.example.starter_project_2025.system.course.mapper;


import com.example.starter_project_2025.system.course.dto.CourseObjectiveCreateRequest;
import com.example.starter_project_2025.system.course.dto.CourseObjectiveResponse;
import com.example.starter_project_2025.system.course.entity.CourseObjective;
import org.springframework.stereotype.Component;

@Component
public class CourseObjectiveMapper {
    public CourseObjective toEntity(
            CourseObjectiveCreateRequest req) {

        return CourseObjective.builder()
                .name(req.getName())
                .description(req.getDescription())
                .build();
    }

    public CourseObjectiveResponse toResponse(
            CourseObjective entity) {

        return CourseObjectiveResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .createdDate(entity.getCreatedDate())
                .build();
    }
}
