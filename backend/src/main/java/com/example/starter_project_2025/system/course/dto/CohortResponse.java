package com.example.starter_project_2025.system.course.dto;

import com.example.starter_project_2025.system.course.enums.CohortStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Builder
public class CohortResponse {

    private UUID id;
    private String code;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer capacity;
    private CohortStatus status;

    private UUID courseId;
    private String courseName;
}
