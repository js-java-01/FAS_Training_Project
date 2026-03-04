package com.example.starter_project_2025.system.course_online.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

import com.example.starter_project_2025.system.course_online.enums.CourseLevelOnline;
import com.example.starter_project_2025.system.course_online.enums.CourseStatusOnline;

@Data
public class CourseUpdateOnlineRequest {

    private String courseName;
    private String courseCode;
    private BigDecimal price;
    private Double discount;
    private CourseLevelOnline level;
    private CourseStatusOnline status;
    private Integer estimatedTime;
    private String note;
    private String description;
    private UUID trainerId;

    private UUID topicId;
}
