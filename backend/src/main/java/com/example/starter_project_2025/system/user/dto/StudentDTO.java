package com.example.starter_project_2025.system.user.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
public class StudentDTO extends UserDTO {
    private String studentCode;
    private String major;
    private String school;
    private Double gpa;
    private LocalDate dob;
    private String gender;
    private String phone;
    private String address;
    private String faAccount;
    private LocalDate joinedDate;
}