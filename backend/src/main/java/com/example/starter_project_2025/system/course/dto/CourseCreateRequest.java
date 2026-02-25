package com.example.starter_project_2025.system.course.dto;

import com.example.starter_project_2025.system.course.enums.CourseLevel;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CourseCreateRequest {

    @NotBlank
    private String courseName;

    @NotBlank
    private String courseCode;

    private BigDecimal price;

    private Double discount;

    private CourseLevel level;

    private Integer estimatedTime;

    private String note;

    private String description;

    private Double minGpaToPass;

    private Double minAttendancePercent;

    private Boolean allowFinalRetake;

    private UUID trainerId;
}
