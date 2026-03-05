package com.example.starter_project_2025.system.training_program.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ImportTrainingProgramResponse {

    private String message;

    private int totalRows;

    private int successCount;

    private int failedCount;

    private List<ImportErrorResponse> errors;

}