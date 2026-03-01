package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.topic.dto.AssessmentComponentRequest;
import com.example.starter_project_2025.system.topic.dto.AssessmentComponentResponse;
import com.example.starter_project_2025.system.topic.dto.AssessmentSchemeConfigDTO;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.entity.TopicAssessmentComponent;
import com.example.starter_project_2025.system.topic.entity.TopicAssessmentScheme;
import com.example.starter_project_2025.system.topic.mapper.AssessmentComponentMapper;
import com.example.starter_project_2025.system.topic.mapper.AssessmentSchemeConfigMapper;
import com.example.starter_project_2025.system.topic.repository.TopicAssessmentComponentRepository;
import com.example.starter_project_2025.system.topic.repository.TopicAssessmentSchemeRepository;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TopicAssessmentSchemeServiceImpl implements TopicAssessmentSchemeService {

    private final TopicRepository topicRepository;
    private final TopicAssessmentSchemeRepository schemeRepository;
    private final TopicAssessmentComponentRepository componentRepository;
    private final AssessmentSchemeConfigMapper configMapper;
    private final AssessmentComponentMapper componentMapper;

    // ================= SCHEME CONFIG =================

    @Override
    public AssessmentSchemeConfigDTO getSchemeConfig(UUID topicId) {
        TopicAssessmentScheme scheme = schemeRepository.findByTopicId(topicId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment scheme not found for topic: " + topicId));
        return configMapper.toDto(scheme);
    }

    @Override
    public AssessmentSchemeConfigDTO updateSchemeConfig(UUID topicId, AssessmentSchemeConfigDTO dto) {
        TopicAssessmentScheme scheme = schemeRepository.findByTopicId(topicId)
                .orElseGet(() -> {
                    Topic topic = topicRepository.findById(topicId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
                    TopicAssessmentScheme newScheme = new TopicAssessmentScheme();
                    newScheme.setTopic(topic);
                    return schemeRepository.save(newScheme);
                });
        configMapper.updateEntity(scheme, dto);
        return configMapper.toDto(scheme);
    }

    // ================= COMPONENT =================

    @Override
    public List<AssessmentComponentResponse> getComponents(UUID topicId) {
        return componentRepository.findByScheme_TopicIdOrderByDisplayOrder(topicId)
                .stream()
                .map(componentMapper::toResponse)
                .toList();
    }

    @Override
    public AssessmentComponentResponse addComponent(UUID topicId, AssessmentComponentRequest request) {
        TopicAssessmentScheme scheme = schemeRepository.findByTopicId(topicId)
                .orElseGet(() -> {
                    Topic topic = topicRepository.findById(topicId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
                    TopicAssessmentScheme newScheme = new TopicAssessmentScheme();
                    newScheme.setTopic(topic);
                    return schemeRepository.save(newScheme);
                });
        TopicAssessmentComponent component = componentMapper.toEntity(request);
        component.setScheme(scheme);
        componentRepository.save(component);
        return componentMapper.toResponse(component);
    }

    @Override
    public List<AssessmentComponentResponse> updateComponents(UUID topicId,
                                                              List<AssessmentComponentRequest> requests) {
        List<TopicAssessmentComponent> components = componentRepository.findByScheme_TopicIdOrderByDisplayOrder(topicId);
        for (int i = 0; i < Math.min(components.size(), requests.size()); i++) {
            componentMapper.updateEntity(components.get(i), requests.get(i));
        }
        return components.stream()
                .map(componentMapper::toResponse)
                .toList();
    }

    @Override
    public void deleteComponent(UUID topicId, UUID componentId) {
        TopicAssessmentComponent component = componentRepository.findById(componentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Component not found"));
        if (!component.getScheme().getTopic().getId().equals(topicId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Component does not belong to this topic");
        }
        componentRepository.delete(component);
    }

    // ================= TOTAL WEIGHT =================

    @Override
    public Double getTotalWeight(UUID topicId) {
        Double total = componentRepository.sumWeightByTopicId(topicId);
        return total != null ? total : 0.0;
    }
}