package com.example.starter_project_2025.system.modulegroups.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ImportResultResponse {
    private int totalRows;
    private int successCount;
    private int failedCount;
    private List<ImportErrorDetail> errors = new ArrayList<>();
}
