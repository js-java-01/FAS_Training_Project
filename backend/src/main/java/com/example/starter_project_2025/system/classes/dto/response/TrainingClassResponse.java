package com.example.starter_project_2025.system.classes.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
public class TrainingClassResponse {

    private UUID id;

    private String className;
    private String description;
    private String classCode;
    private Boolean isActive;

    private String creatorName;
    private String approverName;

    private String semesterName;

    private LocalDate startDate;
    private LocalDate endDate;

}