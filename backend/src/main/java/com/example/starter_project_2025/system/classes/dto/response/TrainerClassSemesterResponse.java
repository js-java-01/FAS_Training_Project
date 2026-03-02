package com.example.starter_project_2025.system.classes.dto.response;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Data
@Getter
@Setter
@NoArgsConstructor
public class TrainerClassSemesterResponse
{
    private UUID SemesterID;
    private String SemesterName;
    private List<TrainerClassResponse> classes;
}
