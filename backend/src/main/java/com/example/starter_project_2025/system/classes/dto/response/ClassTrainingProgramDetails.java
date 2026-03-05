package com.example.starter_project_2025.system.classes.dto.response;

import com.example.starter_project_2025.system.training_program.dto.response.TrainingProgramResponse;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ClassTrainingProgramDetails
{
    private ClassResponse classInfo;
    private TrainingProgramResponse trainingProgramInfo;
}
