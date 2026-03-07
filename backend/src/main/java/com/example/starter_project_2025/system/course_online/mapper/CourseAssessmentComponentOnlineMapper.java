package com.example.starter_project_2025.system.course_online.mapper;

import org.springframework.stereotype.Component;

import com.example.starter_project_2025.system.course_online.dto.CourseAssessmentComponentOnlineResponse;
import com.example.starter_project_2025.system.course_online.entity.CourseAssessmentComponentOnline;

@Component
public class CourseAssessmentComponentOnlineMapper {

    public CourseAssessmentComponentOnlineResponse toResponse(
            CourseAssessmentComponentOnline entity) {

        return CourseAssessmentComponentOnlineResponse.builder()
                .id(entity.getId())
                .type(entity.getType())
                .name(entity.getName())
                .count(entity.getItemCount())
                .weight(entity.getWeight())
                .duration(entity.getDuration())
                .displayOrder(entity.getDisplayOrder())
                .graded(entity.getGraded())
                .build();
    }
}
