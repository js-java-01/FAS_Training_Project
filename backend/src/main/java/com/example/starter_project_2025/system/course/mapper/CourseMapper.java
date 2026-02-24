package com.example.starter_project_2025.system.course.mapper;

import com.example.starter_project_2025.system.course.dto.CourseCreateRequest;
import com.example.starter_project_2025.system.course.dto.CourseResponse;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.enums.CourseStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CourseMapper {

        // CREATE → ENTITY
        public Course toEntity(CourseCreateRequest req) {
                return Course.builder()
                                .courseName(req.getCourseName())
                                .courseCode(req.getCourseCode())
                                .price(req.getPrice())
                                .discount(req.getDiscount())
                                .level(req.getLevel())
                                .estimatedTime(req.getEstimatedTime())
                                // .thumbnailUrl(req.getThumbnailUrl())
                                .note(req.getNote())
                                .description(req.getDescription())
                                .minGpaToPass(req.getMinGpaToPass())
                                .minAttendancePercent(req.getMinAttendancePercent())
                                .allowFinalRetake(req.getAllowFinalRetake())
                                .status(CourseStatus.DRAFT) // default workflow
                                .build();
        }

        // ENTITY → RESPONSE
        public CourseResponse toResponse(Course c) {
                return CourseResponse.builder()
                                .id(c.getId())

                                // BASIC
                                .courseName(c.getCourseName())
                                .courseCode(c.getCourseCode())

                                .price(c.getPrice())
                                .discount(c.getDiscount())

                                // DETAILS
                                .level(c.getLevel())
                                .estimatedTime(c.getEstimatedTime())
                                .thumbnailUrl(c.getThumbnailUrl())

                                // WORKFLOW
                                .status(c.getStatus())

                                // ADDITIONAL
                                .note(c.getNote())
                                .description(c.getDescription())

                                // ASSESSMENT
                                .minGpaToPass(c.getMinGpaToPass())
                                .minAttendancePercent(c.getMinAttendancePercent())
                                .allowFinalRetake(c.getAllowFinalRetake())

                                // TRAINER

                                // CREATOR
                                .createdBy(
                                                c.getCreator() != null ? c.getCreator().getId() : null)
                                .createdByName(
                                                c.getCreator() != null ? c.getCreator().getEmail() : null)
                                .createdDate(c.getCreatedDate())

                                // UPDATER
                                .updatedBy(
                                                c.getUpdater() != null ? c.getUpdater().getId() : null)
                                .updatedByName(
                                                c.getUpdater() != null ? c.getUpdater().getEmail() : null)
                                .updatedDate(c.getUpdatedDate())

                                .build();
        }
}