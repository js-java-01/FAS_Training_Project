package com.example.starter_project_2025.system.course_online.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

import com.example.starter_project_2025.system.course_online.enums.CourseLevelOnline;

@Data
public class CourseCreateOnlineRequest {

    @NotBlank
    private String courseName;

    @NotBlank
    private String courseCode;

    private CourseLevelOnline level;

    private Integer estimatedTime;

    private String note;

    private String description;

    private Double minGpaToPass;

    private Double minAttendancePercent;

    private Boolean allowFinalRetake;

    private UUID trainerId;

    private UUID topicId;
}
