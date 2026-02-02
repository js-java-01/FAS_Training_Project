package com.example.starter_project_2025.system.department.dto;

import lombok.Data;

@Data
public class DepartmentDTO {
    private Long id;
    private String name;
    private String code;
    private String description;
    private String locationId;
    private String locationName;
}