package com.example.starter_project_2025.system.semester.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class SemesterResponse {
    private String id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
}
