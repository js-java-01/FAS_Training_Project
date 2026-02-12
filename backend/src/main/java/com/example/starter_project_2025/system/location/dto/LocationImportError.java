package com.example.starter_project_2025.system.location.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LocationImportError {
    private int rowNumber;
    private String message;
}
