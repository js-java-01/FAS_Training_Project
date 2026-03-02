package com.example.starter_project_2025.system.common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ImportResultResponse {
    private String message;
    private int totalRows;
    private int successCount;
    private int failedCount;
    private List<ImportErrorDetail> errors = new ArrayList<>();

    public void addSuccess() {
        this.successCount++;
    }

    public void addError(int row, String field, String errorMessage) {
        this.failedCount++;
        this.errors.add(new ImportErrorDetail(row, field, errorMessage));
    }

    public void buildMessage() {
        this.message = "Import completed: " + successCount + " succeeded, "
                + failedCount + " failed out of " + totalRows + " rows.";
    }
}
