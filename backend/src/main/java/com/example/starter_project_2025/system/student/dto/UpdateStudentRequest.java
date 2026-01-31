package com.example.starter_project_2025.system.student.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStudentRequest {
    private LocalDate dateOfBirth;
    private String major;
    private String yearLevel;
    private LocalDate enrollmentDate;
    private LocalDate graduationDate;
    private String phoneNumber;
    private String address;
    private String status;
}
