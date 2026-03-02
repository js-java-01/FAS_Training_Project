package com.example.starter_project_2025.system.classes.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
public class ClassResponse {

    private UUID id;

    private String className;
    private String description;
    private String classCode;
    private Boolean isActive;

    private String status;

    private String creatorName;
    private String approverName;

    private List<String> trainerNames;

    private String semesterName;

    private LocalDate startDate;
    private LocalDate endDate;

}