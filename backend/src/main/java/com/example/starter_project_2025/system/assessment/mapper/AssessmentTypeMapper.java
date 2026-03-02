package com.example.starter_project_2025.system.assessment.mapper;

import com.example.starter_project_2025.base.mapper.BaseCrudMapper;
import com.example.starter_project_2025.system.assessment.dto.assessment_type.AssessmentTypeDTO;
import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AssessmentTypeMapper extends BaseCrudMapper<AssessmentType, AssessmentTypeDTO> {
}
