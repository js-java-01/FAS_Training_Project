package com.example.starter_project_2025.system.assessment.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ExportRequest {
    private String keyword;
    private Map<String, String> filters;
    private String sortBy = "name";
    private String sortDirection = "ASC";
    @Min(0)
    private int page = 0;
    @Min(1)
    private int size = 10;
    private Integer totalEntries;
    @NotEmpty
    private List<String> selectedFields;
    @NotNull
    private ExportFormat format = ExportFormat.EXCEL;
}
