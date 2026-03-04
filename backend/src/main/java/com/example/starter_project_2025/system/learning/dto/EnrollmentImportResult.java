package com.example.starter_project_2025.system.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentImportResult {
    public int totalCount;
    public int successCount;
    public int failedCount;
    public byte[] errorFile;
}
