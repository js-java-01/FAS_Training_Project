package com.example.starter_project_2025.system.classes.dto.request;

import com.example.starter_project_2025.system.classes.entity.ClassStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchClassRequest {
    private String keyword;
    private Boolean isActive;
    private ClassStatus classStatus;
    private String semesterId;

}
