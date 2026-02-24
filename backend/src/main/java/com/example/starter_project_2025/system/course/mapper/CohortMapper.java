package com.example.starter_project_2025.system.course.mapper;

import com.example.starter_project_2025.system.course.dto.CohortCreateRequest;
import com.example.starter_project_2025.system.course.dto.CohortResponse;
import com.example.starter_project_2025.system.course.entity.CourseCohort;
import org.springframework.stereotype.Component;

@Component
public class CohortMapper {

    public com.example.starter_project_2025.system.course.entity.CourseCohort toEntity(CohortCreateRequest request) {
        return CourseCohort.builder()
                .code(request.getCode())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .capacity(request.getCapacity())
                .status(request.getStatus())
                .build();
    }

    public CohortResponse toResponse(CourseCohort entity) {
        return CohortResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .capacity(entity.getCapacity())
                .status(entity.getStatus())
                .courseId(entity.getCourse().getId())
                .courseName(entity.getCourse().getCourseName())
                .build();
    }
}
