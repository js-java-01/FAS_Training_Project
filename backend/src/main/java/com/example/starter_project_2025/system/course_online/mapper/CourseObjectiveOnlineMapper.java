package com.example.starter_project_2025.system.course_online.mapper;


import org.springframework.stereotype.Component;

import com.example.starter_project_2025.system.course_online.dto.CourseObjectiveCreateOnlineRequest;
import com.example.starter_project_2025.system.course_online.dto.CourseObjectiveOnlineResponse;
import com.example.starter_project_2025.system.course_online.entity.CourseObjectiveOnline;

@Component
public class CourseObjectiveOnlineMapper {
    public CourseObjectiveOnline toEntity(
            CourseObjectiveCreateOnlineRequest req) {

        return CourseObjectiveOnline.builder()
                .code(req.getCode())
                .name(req.getName())
                .description(req.getDescription())
                .build();
    }

    public CourseObjectiveOnlineResponse toResponse(
            CourseObjectiveOnline entity) {

        return CourseObjectiveOnlineResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .description(entity.getDescription())
                .createdDate(entity.getCreatedDate())
                .build();
    }
}
