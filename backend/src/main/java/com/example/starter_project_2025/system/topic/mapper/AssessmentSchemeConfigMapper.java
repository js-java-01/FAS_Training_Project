package com.example.starter_project_2025.system.topic.mapper;

import com.example.starter_project_2025.system.topic.dto.AssessmentSchemeConfigDTO;
import com.example.starter_project_2025.system.topic.entity.TopicAssessmentScheme;
import org.springframework.stereotype.Component;

@Component
public class AssessmentSchemeConfigMapper {

    public AssessmentSchemeConfigDTO toDto(TopicAssessmentScheme entity) {
        AssessmentSchemeConfigDTO dto = new AssessmentSchemeConfigDTO();

        dto.setMinGpaToPass(entity.getMinGpaToPass());
        dto.setMinAttendance(entity.getMinAttendance());
        dto.setAllowFinalRetake(entity.getAllowFinalRetake());

        return dto;
    }

    public void updateEntity(TopicAssessmentScheme entity, AssessmentSchemeConfigDTO dto) {
        entity.setMinGpaToPass(dto.getMinGpaToPass());
        entity.setMinAttendance(dto.getMinAttendance());
        entity.setAllowFinalRetake(dto.getAllowFinalRetake());
    }   
}
