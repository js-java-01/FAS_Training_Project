package com.example.starter_project_2025.system.course_online.mapper;

import com.example.starter_project_2025.system.course_online.dto.CourseAssessmentComponentResponse;
import com.example.starter_project_2025.system.course_online.entity.CourseAssessmentComponent;
import org.springframework.stereotype.Component;

@Component
public class CourseAssessmentComponentMapper {

    public CourseAssessmentComponentResponse toResponse(
            CourseAssessmentComponent entity) {

        return CourseAssessmentComponentResponse.builder()
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
