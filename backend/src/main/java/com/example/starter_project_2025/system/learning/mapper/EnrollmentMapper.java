package com.example.starter_project_2025.system.learning.mapper;

import com.example.starter_project_2025.system.learning.dto.EnrollmentResponse;
import com.example.starter_project_2025.system.learning.entity.Enrollment;
import org.springframework.stereotype.Component;

@Component
public class EnrollmentMapper {

    public EnrollmentResponse toResponse(Enrollment entity) {
        return new EnrollmentResponse(
                entity.getId(),
                entity.getCohortId(),
                entity.getEnrolledAt(),
                entity.getStatus()
        );
    }
}
