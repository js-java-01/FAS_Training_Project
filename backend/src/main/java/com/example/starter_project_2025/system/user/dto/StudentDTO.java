package com.example.starter_project_2025.system.user.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StudentDTO {

    String studentCode;

    LocalDate dob;

    String gender;

    String phone;

    String address;

    Double gpa;
}