package com.example.starter_project_2025.system.course_online.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

import com.example.starter_project_2025.system.course_online.enums.CourseLevelOnline;
import com.example.starter_project_2025.system.course_online.enums.CourseStatusOnline;

@Data
@Builder
public class CourseOnlineResponse {

    private UUID id;

    private String courseName;
    private String courseCode;

    private CourseLevelOnline level;
    private Integer estimatedTime;

    private CourseStatusOnline status;

    private String thumbnailUrl;

    private String note;
    private String description;

    private Double minGpaToPass;
    private Double minAttendancePercent;
    private Boolean allowFinalRetake;

    private UUID trainerId;
    private String trainerName;

    private UUID topicId;
    private String topicName;

    private UUID createdBy;
    private String createdByName;
    private LocalDateTime createdDate;

    private UUID updatedBy;
    private String updatedByName;
    private LocalDateTime updatedDate;
}
