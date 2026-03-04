package com.example.starter_project_2025.system.learning.dto;

import com.example.starter_project_2025.system.learning.enums.ImportEnrollmentErrorType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ImportEnrollmentError {
    public String email;
    public ImportEnrollmentErrorType type;
}
