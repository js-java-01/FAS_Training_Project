package com.example.starter_project_2025.system.topic_assessment_type_weight.entity.mapper;

import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.dto.TopicAssessmentTypeWeightCreateRequest;
import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.dto.TopicAssessmentTypeWeightResponse;
import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.entity.TopicAssessmentTypeWeight;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class TopicAssessmentTypeWeightMapper
{
    public TopicAssessmentTypeWeightResponse toResponse(TopicAssessmentTypeWeight entity)
    {
        if (entity == null)
        {
            return null;
        }

        TopicAssessmentTypeWeightResponse response = new TopicAssessmentTypeWeightResponse();
        response.setId(entity.getId());
        response.setWeight(entity.getWeight());

        if (entity.getAssessmentType() != null)
        {
            response.setAssessmentTypeId(entity.getAssessmentType().getId());
            response.setAccessmentTypeName(entity.getAssessmentType().getName());
            response.setAssessmentTypeDescription(entity.getAssessmentType().getDescription());
        }

        return response;
    }

    public List<TopicAssessmentTypeWeightResponse> toResponseList(List<TopicAssessmentTypeWeight> entities)
    {
        if (entities == null)
        {
            return null;
        }
        return entities.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TopicAssessmentTypeWeight toEntity(TopicAssessmentTypeWeightCreateRequest request)
    {
        if (request == null)
        {
            return null;
        }

        TopicAssessmentTypeWeight entity = new TopicAssessmentTypeWeight();
        entity.setWeight(request.getWeight());

        if (request.getTopicId() != null)
        {
            Topic topic = new Topic();
            topic.setId(request.getTopicId());
            entity.setTopic(topic);
        }

        if (request.getAssessmentTypeId() != null)
        {
            AssessmentType assessmentType = new AssessmentType();
            assessmentType.setId(request.getAssessmentTypeId().toString());
            entity.setAssessmentType(assessmentType);
        }

        return entity;
    }

    public List<TopicAssessmentTypeWeight> toEntityList(List<TopicAssessmentTypeWeightCreateRequest> requests)
    {
        if (requests == null || requests.isEmpty())
        {
            return Collections.emptyList();
        }

        return requests.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
    }
}
