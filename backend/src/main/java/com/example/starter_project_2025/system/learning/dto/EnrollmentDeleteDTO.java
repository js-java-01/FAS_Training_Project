package com.example.starter_project_2025.system.learning.dto;

import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentDeleteDTO {
    @NotNull(message = "Class ID cannot be null")
    private UUID classID;
    @NotNull(message = "Student ID cannot be null")
    private UUID studentID;
}
