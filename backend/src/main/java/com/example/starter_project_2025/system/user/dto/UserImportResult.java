package com.example.starter_project_2025.system.user.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class UserImportResult {
    private int successCount = 0;
    private List<String> errors = new ArrayList<>();

    public void addSuccess() {
        successCount++;
    }

    public void addError(String error) {
        errors.add(error);
    }
}
