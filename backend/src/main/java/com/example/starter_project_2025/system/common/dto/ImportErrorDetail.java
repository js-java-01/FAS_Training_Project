package com.example.starter_project_2025.system.common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ImportErrorDetail {
    private int row;
    private String field;
    private String message;
}
