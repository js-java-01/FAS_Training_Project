package com.example.starter_project_2025.system.course_online.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.UUID;

import com.example.starter_project_2025.system.course_online.enums.CohortStatusOnline;

@Getter
@Builder
public class CohortOnlineResponse {

    private UUID id;
    private String code;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer capacity;
    private CohortStatusOnline status;

    private UUID courseId;
    private String courseName;
}
