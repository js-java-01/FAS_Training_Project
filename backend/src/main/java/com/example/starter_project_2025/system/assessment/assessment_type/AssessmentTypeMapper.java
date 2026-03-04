package com.example.starter_project_2025.system.assessment.assessment_type;

import com.example.starter_project_2025.base.mapper.BaseCrudMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AssessmentTypeMapper extends BaseCrudMapper<AssessmentType, AssessmentTypeDTO> {
}
