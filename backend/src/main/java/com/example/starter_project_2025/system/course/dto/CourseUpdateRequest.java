package com.example.starter_project_2025.system.course.dto;

import com.example.starter_project_2025.system.course.enums.CourseLevel;
import com.example.starter_project_2025.system.course.enums.CourseStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CourseUpdateRequest {

    private String courseName;
    private String courseCode;
    private BigDecimal price;
    private Double discount;
    private CourseLevel level;
    private CourseStatus status;
    private Integer estimatedTime;
    private String note;
    private String description;
    private UUID trainerId;
}
