package com.example.starter_project_2025.system.training_program.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ImportErrorResponse {

    private int row;

    private String field;

    private String message;

}