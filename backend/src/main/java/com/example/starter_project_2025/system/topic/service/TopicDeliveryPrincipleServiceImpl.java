package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.topic.dto.TopicDeliveryPrincipleRequest;
import com.example.starter_project_2025.system.topic.dto.TopicDeliveryPrincipleResponse;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.entity.TopicDeliveryPrinciple;
import com.example.starter_project_2025.system.topic.mapper.TopicDeliveryPrincipleMapper;
import com.example.starter_project_2025.system.topic.repository.TopicDeliveryPrincipleRepository;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TopicDeliveryPrincipleServiceImpl
                implements TopicDeliveryPrincipleService {

        private final TopicRepository topicRepository;
        private final TopicDeliveryPrincipleRepository repository;
        private final TopicDeliveryPrincipleMapper mapper;

        @Override
        public TopicDeliveryPrincipleResponse getByTopicId(UUID topicId) {

                return repository.findByTopicId(topicId)
                                .map(mapper::toResponse)
                                .orElse(new TopicDeliveryPrincipleResponse());
        }

        @Override
        public TopicDeliveryPrincipleResponse save(UUID topicId,
                        TopicDeliveryPrincipleRequest request) {

                Topic topic = topicRepository.findById(topicId)
                                .orElseThrow(() -> new RuntimeException("Topic not found"));

                TopicDeliveryPrinciple entity = repository.findByTopicId(topicId)
                                .orElseGet(() -> TopicDeliveryPrinciple.builder()
                                                .topic(topic)
                                                .build());

                mapper.updateEntity(entity, request);

                repository.save(entity);

                return mapper.toResponse(entity);
        }
}
