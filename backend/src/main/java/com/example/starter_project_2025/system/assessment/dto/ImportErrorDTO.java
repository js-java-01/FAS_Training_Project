package com.example.starter_project_2025.system.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ImportErrorDTO {
    private int row;
    private String message;
}
