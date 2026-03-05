package com.example.starter_project_2025.system.course_online.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

import com.example.starter_project_2025.system.course_online.enums.CohortStatusOnline;

@Getter
@Setter
public class CohortCreateOnlineRequest {

    private String code;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer capacity;
    private CohortStatusOnline status;
    private UUID courseId;
}
