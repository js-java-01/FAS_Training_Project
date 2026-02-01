package com.example.starter_project_2025.system.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImportResultDTO {
    private int totalRows;
    private int successCount;
    private int errorCount;
    private List<ImportErrorDTO> errors;
}
