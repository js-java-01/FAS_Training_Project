package com.example.starter_project_2025.system.assessment_mgt.assessment;


import com.example.starter_project_2025.base.crud.BaseCrudMapper;
import com.example.starter_project_2025.system.assessment_mgt.assessment.response.AssessmentResponse;
import com.example.starter_project_2025.system.assessment_mgt.assessment.request.CreateAssessmentRequest;
import com.example.starter_project_2025.system.assessment_mgt.assessment.request.UpdateAssessmentRequest;
import com.example.starter_project_2025.system.assessment_mgt.assessment_type.AssessmentType;
import com.example.starter_project_2025.system.assessment_mgt.assessment_type.AssessmentTypeDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")

public interface AssessmentMapper extends BaseCrudMapper<Assessment, AssessmentDTO> {

}
