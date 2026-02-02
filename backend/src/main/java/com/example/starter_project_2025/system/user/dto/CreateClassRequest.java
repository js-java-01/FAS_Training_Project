package com.example.starter_project_2025.system.user.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class CreateClassRequest {
    private String className;
    private LocalDate startDate;
    private LocalDate endDate;
}