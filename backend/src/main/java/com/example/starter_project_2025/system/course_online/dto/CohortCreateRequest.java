package com.example.starter_project_2025.system.course_online.dto;

import com.example.starter_project_2025.system.course_online.enums.CohortStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class CohortCreateRequest {

    private String code;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer capacity;
    private CohortStatus status;
    private UUID courseId;
}
