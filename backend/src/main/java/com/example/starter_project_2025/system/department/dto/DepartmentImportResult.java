package com.example.starter_project_2025.system.department.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class DepartmentImportResult {

    private int total;
    private int success;
    private int failed;

    private List<String> errorMessages = new ArrayList<>();

    public void addError(String message) {
        errorMessages.add(message);
        failed++;
    }

    public void addSuccess() {
        success++;
    }
}

