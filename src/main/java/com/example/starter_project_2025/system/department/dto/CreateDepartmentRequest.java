package com.example.starter_project_2025.system.department.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateDepartmentRequest {

    @NotBlank(message = "Department Name is required")
    @Size(max = 255, message = "Name must be less than 255 characters")
    private String name; // Required Field

    @NotBlank(message = "Department Code is required")
    @Size(max = 50, message = "Code must be less than 50 characters")
    private String code; // Required Field, Unique Business Rule handled in Service

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description; // Optional Field

    @NotNull(message = "Location ID is required")
    private UUID locationId; // Required Field (dropdown in FE sends an ID)
}
