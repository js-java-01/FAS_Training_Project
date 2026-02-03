package com.example.starter_project_2025.system.user.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class EnrollStudentRequest {
    private UUID studentId;
    private UUID classId;
}