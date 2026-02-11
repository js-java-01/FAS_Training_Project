package com.example.starter_project_2025.system.department.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DepartmentExportDTO {

    private String code;
    private String name;
    private String description;
    private String locationName;
}
