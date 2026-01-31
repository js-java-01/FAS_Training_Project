package com.example.starter_project_2025.system.student.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateStudentRequest {
    @NotBlank(message = "Student ID is required")
    private String studentId;

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;

    private String major;
    private String yearLevel;

    @NotNull(message = "Enrollment date is required")
    private LocalDate enrollmentDate;

    private LocalDate graduationDate;
    private String phoneNumber;
    private String address;
    private String status;
}
