package com.example.starter_project_2025.system.department.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class DepartmentDTO {
    private UUID id;
    private String name;
    private String code;
    private String description;
    private String locationId;
    private String locationName;
    private String status;
}