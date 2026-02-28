package com.example.starter_project_2025.system.classes.dto.response;

import com.example.starter_project_2025.system.classes.entity.ClassStatus;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Getter
@Setter
public class TrainerClassResponse
{
    private UUID id;

    private String className;
    private String classCode;
    private Boolean isActive;
    private ClassStatus status;

    private String creatorName;
    private String approverName;

    private int numberOfTrainees;
    private int numberOfCourses;

    private String semesterName;

    private LocalDate startDate;
    private LocalDate endDate;
}
