package com.example.starter_project_2025.system.course.dto;

import com.example.starter_project_2025.system.course.enums.CourseLevel;
import com.example.starter_project_2025.system.course.enums.CourseStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class CourseResponse {

    private UUID id;

    private String courseName;
    private String courseCode;

    private BigDecimal price;
    private Double discount;

    private CourseLevel level;
    private Integer estimatedTime;

    private CourseStatus status;

    private String thumbnailUrl;

    private String note;
    private String description;

    private Double minGpaToPass;
    private Double minAttendancePercent;
    private Boolean allowFinalRetake;

    private UUID trainerId;
    private String trainerName;

    private UUID createdBy;
    private String createdByName;
    private LocalDateTime createdDate;

    private UUID updatedBy;
    private String updatedByName;
    private LocalDateTime updatedDate;
}
