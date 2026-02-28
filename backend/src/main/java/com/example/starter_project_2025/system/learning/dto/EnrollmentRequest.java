package com.example.starter_project_2025.system.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentRequest
{
    private UUID classID;
    private String enrollKey;

}