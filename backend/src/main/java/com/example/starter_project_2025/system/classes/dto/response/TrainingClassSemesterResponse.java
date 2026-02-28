package com.example.starter_project_2025.system.classes.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrainingClassSemesterResponse
{
    private UUID SemesterID;
    private String SemesterName;
    private List<TrainingClassResponse> classes;
}