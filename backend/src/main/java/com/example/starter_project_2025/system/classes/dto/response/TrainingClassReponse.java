package com.example.starter_project_2025.system.classes.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@Builder
public class TrainingClassReponse
{
    private UUID id;

    private String className;
    private String description;
    private String classCode;
    private String enrollmentKey;
    private Boolean isActive;

    private String status;

    private String creatorName;
    private String approverName;

    private List<String> trainerNames;

    private String semesterName;

    private UUID trainingProgramId;
    private String trainingProgramName;

    private LocalDate startDate;
    private LocalDate endDate;
}
