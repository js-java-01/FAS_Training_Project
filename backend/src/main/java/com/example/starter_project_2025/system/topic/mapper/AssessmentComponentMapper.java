package com.example.starter_project_2025.system.topic.mapper;

import com.example.starter_project_2025.system.topic.dto.AssessmentComponentRequest;
import com.example.starter_project_2025.system.topic.dto.AssessmentComponentResponse;
import com.example.starter_project_2025.system.topic.entity.TopicAssessmentComponent;
import org.springframework.stereotype.Component;

@Component
public class AssessmentComponentMapper {

    public AssessmentComponentResponse toResponse(TopicAssessmentComponent entity) {

        AssessmentComponentResponse dto = new AssessmentComponentResponse();

        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setType(entity.getType());
        dto.setCount(entity.getCount());
        dto.setWeight(entity.getWeight());
        dto.setDuration(entity.getDuration());
        dto.setDisplayOrder(entity.getDisplayOrder());
        dto.setIsGraded(entity.getIsGraded());
        dto.setNote(entity.getNote());

        return dto;
    }

    public TopicAssessmentComponent toEntity(AssessmentComponentRequest request) {

        TopicAssessmentComponent entity = new TopicAssessmentComponent();

        entity.setName(request.getName());
        entity.setType(request.getType());
        entity.setCount(request.getCount());
        entity.setWeight(request.getWeight());
        entity.setDuration(request.getDuration());
        entity.setDisplayOrder(request.getDisplayOrder());
        entity.setIsGraded(request.getIsGraded());
        entity.setNote(request.getNote());

        return entity;
    }

    public void updateEntity(TopicAssessmentComponent entity, AssessmentComponentRequest request) {

        entity.setName(request.getName());
        entity.setType(request.getType());
        entity.setCount(request.getCount());
        entity.setWeight(request.getWeight());
        entity.setDuration(request.getDuration());
        entity.setDisplayOrder(request.getDisplayOrder());
        entity.setIsGraded(request.getIsGraded());
        entity.setNote(request.getNote());
    }
}
