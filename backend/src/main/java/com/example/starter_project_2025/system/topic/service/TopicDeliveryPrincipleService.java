package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.topic.dto.TopicDeliveryPrincipleRequest;
import com.example.starter_project_2025.system.topic.dto.TopicDeliveryPrincipleResponse;

import java.util.UUID;

public interface TopicDeliveryPrincipleService {

    TopicDeliveryPrincipleResponse getByTopicId(UUID topicId);

    TopicDeliveryPrincipleResponse save(UUID topicId,
                                        TopicDeliveryPrincipleRequest request);
}
