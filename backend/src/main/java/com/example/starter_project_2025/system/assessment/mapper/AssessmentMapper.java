package com.example.starter_project_2025.system.assessment.mapper;


import com.example.starter_project_2025.system.assessment.dto.assessment.response.AssessmentResponse;
import com.example.starter_project_2025.system.assessment.dto.assessment.request.CreateAssessmentRequest;
import com.example.starter_project_2025.system.assessment.dto.assessment.request.UpdateAssessmentRequest;
import com.example.starter_project_2025.system.assessment.entity.Assessment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")

public interface AssessmentMapper {
    AssessmentResponse toDto(Assessment assessment);

    List<AssessmentResponse> toDto(List<Assessment> assessments);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Assessment toEntity(CreateAssessmentRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(
            UpdateAssessmentRequest request,
            @MappingTarget Assessment assessment
    );
}
