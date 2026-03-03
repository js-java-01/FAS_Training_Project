package com.example.starter_project_2025.system.course_online.dto;

import lombok.Data;

@Data
public class MaterialUpdateRequest {
    private String title;
    private String description;
    private String type;
    private String sourceUrl;
    private String tags;
    private Integer displayOrder;
    private Boolean isActive;
}
