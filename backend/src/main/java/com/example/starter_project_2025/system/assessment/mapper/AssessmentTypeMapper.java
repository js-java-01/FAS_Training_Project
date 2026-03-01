package com.example.starter_project_2025.system.assessment.mapper;

import com.example.starter_project_2025.system.assessment.dto.assessmentType.response.AssessmentTypeResponse;
import com.example.starter_project_2025.system.assessment.dto.AssessmentImportRequest;
import com.example.starter_project_2025.system.assessment.dto.assessmentType.request.CreateAssessmentTypeRequest;
import com.example.starter_project_2025.system.assessment.dto.assessmentType.request.UpdateAssessmentTypeRequest;
import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AssessmentTypeMapper {

    AssessmentTypeResponse toDto(AssessmentType assessmentType);

    List<AssessmentTypeResponse> toDto(List<AssessmentType> assessmentTypes);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    AssessmentType toEntity(CreateAssessmentTypeRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(UpdateAssessmentTypeRequest request, @MappingTarget AssessmentType assessmentType);

    AssessmentType toEntity(AssessmentImportRequest request);

}
