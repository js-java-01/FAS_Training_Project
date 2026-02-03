package com.example.starter_project_2025.system.programminglanguage.dto;

import java.util.ArrayList;
import java.util.List;

public class ImportResultResponse {
    private int successCount;
    private int failureCount;
    private List<ImportError> errors;

    public ImportResultResponse() {
        this.successCount = 0;
        this.failureCount = 0;
        this.errors = new ArrayList<>();
    }

    public int getSuccessCount() {
        return successCount;
    }

    public void setSuccessCount(int successCount) {
        this.successCount = successCount;
    }

    public int getFailureCount() {
        return failureCount;
    }

    public void setFailureCount(int failureCount) {
        this.failureCount = failureCount;
    }

    public List<ImportError> getErrors() {
        return errors;
    }

    public void setErrors(List<ImportError> errors) {
        this.errors = errors;
    }

    public void incrementSuccess() {
        this.successCount++;
    }

    public void addError(int row, String message) {
        this.failureCount++;
        this.errors.add(new ImportError(row, message));
    }

    public static class ImportError {
        private int row;
        private String message;

        public ImportError(int row, String message) {
            this.row = row;
            this.message = message;
        }

        public int getRow() {
            return row;
        }

        public void setRow(int row) {
            this.row = row;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
