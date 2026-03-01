package com.example.starter_project_2025.system.topic.controller;

import com.example.starter_project_2025.system.topic.dto.TopicDeliveryPrincipleRequest;
import com.example.starter_project_2025.system.topic.dto.TopicDeliveryPrincipleResponse;
import com.example.starter_project_2025.system.topic.service.TopicDeliveryPrincipleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/topics/{topicId}/delivery-principle")
@RequiredArgsConstructor
public class TopicDeliveryPrincipleController {

    private final TopicDeliveryPrincipleService service;

    @GetMapping
    public TopicDeliveryPrincipleResponse
    get(@PathVariable UUID topicId) {
        return service.getByTopicId(topicId);
    }

    @PutMapping
    public TopicDeliveryPrincipleResponse update(
            @PathVariable UUID topicId,
            @RequestBody TopicDeliveryPrincipleRequest request) {

        return service.save(topicId, request);
    }
}
