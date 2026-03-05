package com.example.starter_project_2025.system.topic_assessment_type_weight.entity.service;

import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.dto.TopicAssessmentTypeWeightCreateRequest;
import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.dto.TopicAssessmentTypeWeightResponse;
import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.mapper.TopicAssessmentTypeWeightMapper;
import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.repository.TopicAssessmentTypeWeightRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TopicAssessmentTypeWeightServiceImpl implements TopicAssessmentTypeWeightService
{
    private final TopicAssessmentTypeWeightRepository topicAssessmentTypeWeightRepository;
    private final TopicAssessmentTypeWeightMapper mapper;

    @Override
    public List<TopicAssessmentTypeWeightResponse> getWeightsByTopicId(UUID topicId)
    {
        var results = topicAssessmentTypeWeightRepository.findByTopicId(topicId);
        return mapper.toResponseList(results);
    }

    @Override
    @Transactional
    public List<TopicAssessmentTypeWeightResponse> createAndUpdateWeightsByTopicId(UUID topicId, List<TopicAssessmentTypeWeightCreateRequest> request)
    {
        if (!validateTotalWeight(request))
        {
            throw new IllegalArgumentException("Total weight must be 100%");
        }
        topicAssessmentTypeWeightRepository.deleteByTopic_Id((topicId));

        var entities = mapper.toEntityList(request);
        var savedEntities = topicAssessmentTypeWeightRepository.saveAll(entities);

        return mapper.toResponseList(savedEntities);
    }

    private boolean validateTotalWeight(List<TopicAssessmentTypeWeightCreateRequest> request)
    {
        double totalWeight = request.stream().mapToDouble(TopicAssessmentTypeWeightCreateRequest::getWeight).sum();
        return totalWeight == 100;
    }
}
